"use server";

import { revalidatePath } from "next/cache";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/features/auth/session";
import { buildingSchema, categorySchema, orderStatusSchema, productSchema } from "@/features/admin/schemas";
import { mapOrderError } from "@/features/orders/errors";
import { notifyAfterCommit } from "@/features/notifications/notify";
import { slugify } from "@/lib/slug";
import { hasDuplicateName } from "@/lib/unique-name";
import { MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_BUCKET } from "@/lib/constants";

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  const parsed = orderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Choose a valid status.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: parsed.data.orderId,
    p_new_status: parsed.data.status,
    p_note: parsed.data.note || undefined,
  });
  if (error) {
    return actionError(mapOrderError(error.message));
  }

  await notifyAfterCommit(supabase, "notify_order_status_change", parsed.data.orderId);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/notifications");
  revalidatePath("/admin/notifications");
  revalidatePath("/orders");
  revalidatePath(`/orders/${parsed.data.orderId}`);
  revalidatePath("/", "layout");
  return actionSuccess("Order status updated.");
}

export async function collectPayment(orderId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("mark_payment_collected", { p_order_id: orderId });
  if (error) {
    return actionError(mapOrderError(error.message));
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return actionSuccess("Payment marked as collected.");
}

async function uniqueSlug(table: "products" | "categories", name: string, excludeId?: string) {
  const { supabase } = await requireAdmin();
  const base = slugify(name);
  let slug = base;
  for (let n = 2; n < 50; n += 1) {
    const { data } = await supabase.from(table).select("id").eq("slug", slug).limit(1);
    const existing = data?.[0];
    if (!existing || existing.id === excludeId) {
      return slug;
    }
    slug = `${base}-${n}`;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function uploadProductImage(file: File, productId: string) {
  if (file.size === 0) {
    return null;
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Keep the product image under 200 KB.");
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.type)) {
    throw new Error("Use a JPG, PNG, WebP or AVIF image.");
  }
  const ext = file.type.split("/")[1] ?? "webp";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const { supabase } = await requireAdmin();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) {
    throw new Error("Could not upload the image.");
  }
  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function saveProduct(formData: FormData): Promise<ActionResult> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description") ?? "",
    unit: formData.get("unit"),
    quantityStep: formData.get("quantityStep"),
    price: formData.get("price"),
    stockQuantity: formData.get("stockQuantity"),
  });
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the product form.");
  }

  const { supabase } = await requireAdmin();
  const productId = String(formData.get("id") ?? "");
  const { data: namedProducts } = await supabase.from("products").select("id, name");
  if (hasDuplicateName(namedProducts ?? [], parsed.data.name, productId || undefined)) {
    return actionError("A product with this name already exists.");
  }
  const slug = await uniqueSlug("products", parsed.data.name, productId || undefined);
  const file = formData.get("image");

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.data.name,
        slug,
        category_id: parsed.data.categoryId,
        description: parsed.data.description || null,
        unit: parsed.data.unit,
        quantity_step: parsed.data.quantityStep,
        price: parsed.data.price,
        stock_quantity: parsed.data.stockQuantity,
      })
      .eq("id", productId);
    if (error) {
      return actionError("Could not update the product.");
    }
    if (file instanceof File && file.size > 0) {
      try {
        const imageUrl = await uploadProductImage(file, productId);
        if (imageUrl) {
          await supabase.from("products").update({ image_url: imageUrl }).eq("id", productId);
        }
      } catch (error) {
        return actionError(error instanceof Error ? error.message : "Could not upload the image.");
      }
    }
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: parsed.data.name,
        slug,
        category_id: parsed.data.categoryId,
        description: parsed.data.description || null,
        unit: parsed.data.unit,
        quantity_step: parsed.data.quantityStep,
        price: parsed.data.price,
        stock_quantity: parsed.data.stockQuantity,
        status: "active",
      })
      .select("id")
      .maybeSingle();
    if (error || !data) {
      return actionError("Could not create the product.");
    }
    if (file instanceof File && file.size > 0) {
      try {
        const imageUrl = await uploadProductImage(file, data.id);
        if (imageUrl) {
          await supabase.from("products").update({ image_url: imageUrl }).eq("id", data.id);
        }
      } catch (error) {
        return actionError(error instanceof Error ? error.message : "Could not upload the image.");
      }
    }
  }

  revalidateStorefront();
  revalidatePath("/admin/products");
  return actionSuccess(productId ? "Product updated." : "Product added.");
}

export async function setProductStatus(productId: string, status: "active" | "inactive"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ status }).eq("id", productId);
  if (error) {
    return actionError("Could not update product status.");
  }
  revalidateStorefront();
  revalidatePath("/admin/products");
  return actionSuccess(status === "active" ? "Product activated." : "Product deactivated.");
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(productId)) {
    return actionError("Could not delete the product.");
  }
  const { supabase } = await requireAdmin();
  const { data: product } = await supabase.from("products").select("id, image_url").eq("id", productId).maybeSingle();
  if (!product) {
    return actionError("That product is no longer in the list.");
  }
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    if (error.code === "23503") {
      return actionError("Past orders still point to this product. Deactivate it instead.");
    }
    return actionError("Could not delete the product.");
  }
  if (product.image_url) {
    const marker = `/${PRODUCT_IMAGE_BUCKET}/`;
    const index = product.image_url.indexOf(marker);
    if (index >= 0) {
      const path = decodeURIComponent(product.image_url.slice(index + marker.length).split("?")[0] ?? "");
      if (path) {
        await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
      }
    }
  }
  revalidateStorefront();
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  return actionSuccess("Product deleted.");
}

export async function saveCategory(input: unknown, categoryId?: string): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the category form.");
  }
  const { supabase } = await requireAdmin();
  const { data: namedCategories } = await supabase.from("categories").select("id, name");
  if (hasDuplicateName(namedCategories ?? [], parsed.data.name, categoryId)) {
    return actionError("A category with this name already exists.");
  }
  const slug = await uniqueSlug("categories", parsed.data.name, categoryId);
  let error;
  if (categoryId) {
    ({ error } = await supabase.from("categories").update({ name: parsed.data.name, slug }).eq("id", categoryId));
  } else {
    const { data: rows } = await supabase.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const nextSort = (rows?.[0]?.sort_order ?? -1) + 1;
    ({ error } = await supabase.from("categories").insert({
      name: parsed.data.name,
      slug,
      is_active: true,
      sort_order: nextSort,
    }));
  }
  if (error) {
    return actionError("Could not save the category.");
  }
  revalidateStorefront();
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  return actionSuccess(categoryId ? "Category updated." : "Category added.");
}

export async function setCategoryStatus(categoryId: string, isActive: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").update({ is_active: isActive }).eq("id", categoryId);
  if (error) {
    return actionError("Could not update category status.");
  }
  revalidateStorefront();
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  return actionSuccess(isActive ? "Category activated." : "Category deactivated.");
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(categoryId)) {
    return actionError("Could not delete the category.");
  }
  const { supabase } = await requireAdmin();
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if ((count ?? 0) > 0) {
    return actionError("Move or delete this category's products first.");
  }
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) {
    return actionError("Could not delete the category.");
  }
  revalidateStorefront();
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  return actionSuccess("Category deleted.");
}

export async function saveBuilding(input: unknown, buildingId?: string): Promise<ActionResult> {
  const parsed = buildingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the building form.");
  }
  const { supabase } = await requireAdmin();
  const { data: namedBuildings } = await supabase.from("buildings").select("id, name");
  if (hasDuplicateName(namedBuildings ?? [], parsed.data.name, buildingId)) {
    return actionError("A building with this name already exists.");
  }
  const payload = {
    name: parsed.data.name,
    address: parsed.data.address || null,
  };
  const { error } = buildingId
    ? await supabase.from("buildings").update(payload).eq("id", buildingId)
    : await supabase.from("buildings").insert({ ...payload, is_active: true });
  if (error) {
    if (error.code === "23505") {
      return actionError("A building with this name already exists.");
    }
    return actionError("Could not save the building.");
  }
  revalidateStorefront();
  revalidatePath("/admin/buildings");
  return actionSuccess(buildingId ? "Building updated." : "Building added.");
}

export async function setBuildingStatus(buildingId: string, isActive: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("buildings").update({ is_active: isActive }).eq("id", buildingId);
  if (error) {
    return actionError("Could not update building status.");
  }
  revalidateStorefront();
  revalidatePath("/admin/buildings");
  return actionSuccess(isActive ? "Building activated." : "Building deactivated.");
}

export async function deleteBuilding(buildingId: string): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(buildingId)) {
    return actionError("Could not delete the building.");
  }
  const { supabase } = await requireAdmin();
  const [{ count: profileCount }, { count: addressCount }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("building_id", buildingId),
    supabase.from("addresses").select("id", { count: "exact", head: true }).eq("building_id", buildingId),
  ]);
  if ((profileCount ?? 0) + (addressCount ?? 0) > 0) {
    return actionError("Customers still use this building. Deactivate it instead.");
  }
  const { error } = await supabase.from("buildings").delete().eq("id", buildingId);
  if (error) {
    if (error.code === "23503") {
      return actionError("Customers still use this building. Deactivate it instead.");
    }
    return actionError("Could not delete the building.");
  }
  revalidateStorefront();
  revalidatePath("/admin/buildings");
  return actionSuccess("Building deleted.");
}
