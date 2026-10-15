export type SnapshotAddress = {
  line1: string;
  landmark?: string | null;
  pincode?: string | null;
};

export function parseAddressSnapshot(snapshot: unknown): SnapshotAddress | null {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  const record = snapshot as Record<string, unknown>;
  const line1 = typeof record.line1 === "string" ? record.line1.trim() : "";
  if (!line1) {
    return null;
  }

  return {
    line1,
    landmark: typeof record.landmark === "string" ? record.landmark : null,
    pincode: typeof record.pincode === "string" ? record.pincode : null,
  };
}
