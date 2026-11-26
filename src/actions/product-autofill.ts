"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchPublicHtml, SafeFetchError } from "@/lib/product-autofill/safe-fetch";
import {
  hasAutofillData,
  isBotChallengePage,
  parseProductMetadata,
} from "@/lib/product-autofill/parse-product-metadata";
import { normalizePurchaseUrl } from "@/lib/purchase-url";
import type { ActionResult } from "@/types/actions";
import type { ProductAutofillData } from "@/types/product-autofill";

export async function fetchProductAutofill(
  productUrl: string,
): Promise<ActionResult<ProductAutofillData>> {
  const normalized = normalizePurchaseUrl(productUrl);
  if (!normalized.success) {
    return normalized;
  }
  if (!normalized.data) {
    return { success: false, error: "Enter a product URL to auto-fill." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Sign in to use auto-fill." };
    }

    const html = await fetchPublicHtml(normalized.data);
    const data = parseProductMetadata(html);
    if (!hasAutofillData(data)) {
      if (isBotChallengePage(html)) {
        return {
          success: false,
          error:
            "That store blocked automated access, so details can't be auto-filled. Your link is kept — enter the details manually.",
        };
      }
      return {
        success: false,
        error: "No product details were found on that page. Enter them manually.",
      };
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof SafeFetchError) {
      return { success: false, error: error.message };
    }
    console.error("Product auto-fill failed.", error);
    return {
      success: false,
      error: "Could not read that page. Enter the details manually.",
    };
  }
}
