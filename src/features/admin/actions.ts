"use server";

import { revalidatePath, updateTag } from "next/cache";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/features/auth/session";
import { buildingSchema, categorySchema, orderStatusSchema, productSchema } from "@/features/admin/schemas";
import { mapOrderError } from "@/features/orders/errors";
import { notifyAfterCommit } from "@/features/notifications/notify";
import { slugify } from "@/lib/slug";
import { MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_BUCKET } from "@/lib/constants";

function revalidateStorefront() {
  updateTag("catalog");
  updateTag("buildings");
  updateTag("settings");
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
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the product form.");
  }

  const { supabase } = await requireAdmin();
  const productId = String(formData.get("id") ?? "");
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
        status: parsed.data.status,
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
        status: parsed.data.status,
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

export async function saveCategory(input: unknown, categoryId?: string): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the category form.");
  }
  const { supabase } = await requireAdmin();
  const slug = await uniqueSlug("categories", parsed.data.name, categoryId);
  const payload = {
    name: parsed.data.name,
    slug,
    is_active: parsed.data.isActive,
  };
  let error;
  if (categoryId) {
    ({ error } = await supabase.from("categories").update(payload).eq("id", categoryId));
  } else {
    const { data: rows } = await supabase.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const nextSort = (rows?.[0]?.sort_order ?? -1) + 1;
    ({ error } = await supabase.from("categories").insert({ ...payload, sort_order: nextSort }));
  }
  if (error) {
    return actionError("Could not save the category.");
  }
  revalidateStorefront();
  revalidatePath("/admin/products");
  return actionSuccess(categoryId ? "Category updated." : "Category added.");
}

export async function saveBuilding(input: unknown, buildingId?: string): Promise<ActionResult> {
  const parsed = buildingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the building form.");
  }
  const { supabase } = await requireAdmin();
  const payload = {
    name: parsed.data.name,
    address: parsed.data.address || null,
  };
  const { error } = buildingId
    ? await supabase.from("buildings").update(payload).eq("id", buildingId)
    : await supabase.from("buildings").insert({ ...payload, is_active: true });
  if (error) {
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
