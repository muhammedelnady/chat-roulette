/** @format */

function hasValidEntityId(obj: Record<string, unknown>): boolean {
  const id = obj["id"];
  const altId = obj["_id"];
  if (typeof id === "string" && id.trim().length > 0) return true;
  if (typeof altId === "string" && altId.trim().length > 0) {
    if (id === undefined) {
      obj["id"] = altId;
    }
    return true;
  }
  return false;
}

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
      if (hasValidEntityId(nested)) {
        return nested as T;
      }
    }
  }

  if (record["data"] && typeof record["data"] === "object" && !Array.isArray(record["data"])) {
    const inner = record["data"] as Record<string, unknown>;
    for (const key of preferredKeys) {
      const innerVal = inner[key];
      if (innerVal && typeof innerVal === "object" && !Array.isArray(innerVal)) {
        const innerRecord = innerVal as Record<string, unknown>;
        if (hasValidEntityId(innerRecord)) {
          return innerRecord as T;
        }
      }
    }
    if (hasValidEntityId(inner)) {
      return inner as T;
    }
  }

  if (hasValidEntityId(record)) {
    return record as T;
  }

  return null;
}
