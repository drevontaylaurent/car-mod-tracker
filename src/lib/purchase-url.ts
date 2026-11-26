export const PURCHASE_URL_MAX_LENGTH = 2048;

export type PurchaseUrlResult =
  | { success: true; data: string | null }
  | { success: false; error: string };

const INVALID_URL_ERROR = "Enter a valid http:// or https:// purchase link.";

export function normalizePurchaseUrl(value: unknown): PurchaseUrlResult {
  if (value === null || value === undefined) {
    return { success: true, data: null };
  }
  if (typeof value !== "string") {
    return { success: false, error: INVALID_URL_ERROR };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { success: true, data: null };
  }
  if (trimmed.length > PURCHASE_URL_MAX_LENGTH) {
    return {
      success: false,
      error: `Purchase link must be ${PURCHASE_URL_MAX_LENGTH} characters or fewer.`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { success: false, error: INVALID_URL_ERROR };
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.hostname.length === 0
  ) {
    return { success: false, error: INVALID_URL_ERROR };
  }

  return { success: true, data: parsed.href };
}

export function getSafePurchaseUrl(value: string | null): string | null {
  const result = normalizePurchaseUrl(value);
  return result.success ? result.data : null;
}
