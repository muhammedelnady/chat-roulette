/** @format */

export function extractEnvelopeEntity<T extends object>(
  raw: unknown,
  preferredKeys: string[] = []
): T | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;

  for (const key of preferredKeys) {
    const val = record[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const nested = val as Record<string, unknown>;
      if ("id" in nested || "_id" in nested) {
        return nested as T;
      }
    }
  }

  if (record["data"] && typeof record["data"] === "object" && !Array.isArray(record["data"])) {
    const inner = record["data"] as Record<string, unknown>;
    for (const key of preferredKeys) {
      const innerVal = inner[key];
      if (innerVal && typeof innerVal === "object" && !Array.isArray(innerVal)) {
        if ("id" in innerVal || "_id" in innerVal) {
          return innerVal as T;
        }
      }
    }
    if ("id" in inner || "_id" in inner) {
      return inner as T;
    }
  }

  if ("id" in record || "_id" in record) {
    return record as T;
  }

  return null;
}
