import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PURCHASE_URL_MAX_LENGTH,
  getSafePurchaseUrl,
  normalizePurchaseUrl,
} from "./purchase-url.ts";

describe("normalizePurchaseUrl", () => {
  it("accepts http and https URLs", () => {
    for (const url of [
      "https://example.com/product",
      "http://example.com/product",
      "https://example.com/product?id=123",
    ]) {
      assert.deepEqual(normalizePurchaseUrl(url), { success: true, data: url });
    }
  });

  it("trims surrounding whitespace", () => {
    assert.deepEqual(normalizePurchaseUrl("  https://example.com/p  "), {
      success: true,
      data: "https://example.com/p",
    });
  });

  it("normalizes blank values to null", () => {
    for (const value of ["", "   ", null, undefined]) {
      assert.deepEqual(normalizePurchaseUrl(value), { success: true, data: null });
    }
  });

  it("rejects unsupported or malformed URLs", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,test",
      "file:///test",
      "not-a-url",
    ]) {
      assert.equal(normalizePurchaseUrl(url).success, false, url);
    }
  });

  it("rejects overlength URLs", () => {
    const url = `https://example.com/${"a".repeat(PURCHASE_URL_MAX_LENGTH)}`;
    assert.equal(normalizePurchaseUrl(url).success, false);
  });
});

describe("getSafePurchaseUrl", () => {
  it("returns null for unsafe stored values", () => {
    assert.equal(getSafePurchaseUrl("javascript:alert(1)"), null);
    assert.equal(getSafePurchaseUrl(null), null);
    assert.equal(getSafePurchaseUrl("https://example.com/x"), "https://example.com/x");
  });
});
