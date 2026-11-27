import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeVinBarcodeResult } from "./vin-barcode.ts";

describe("normalizeVinBarcodeResult", () => {
  it("accepts a valid 17-character VIN", () => {
    assert.equal(
      normalizeVinBarcodeResult("1HGFA16547L000001"),
      "1HGFA16547L000001",
    );
  });

  it("normalizes lowercase VINs to uppercase", () => {
    assert.equal(
      normalizeVinBarcodeResult("1hgfa16547l000001"),
      "1HGFA16547L000001",
    );
  });

  it("trims surrounding whitespace", () => {
    assert.equal(
      normalizeVinBarcodeResult(" \n1HGFA16547L000001\t "),
      "1HGFA16547L000001",
    );
  });

  it("rejects invalid lengths and non-VIN barcode payloads", () => {
    assert.equal(normalizeVinBarcodeResult("1HGFA16547L00000"), null);
    assert.equal(normalizeVinBarcodeResult("STORE-PRODUCT-123"), null);
    assert.equal(normalizeVinBarcodeResult("1HGFA16547I000001"), null);
  });
});
