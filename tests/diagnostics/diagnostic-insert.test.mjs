import assert from "node:assert/strict";
import test from "node:test";
import { buildDiagnosticInsert } from "../../src/lib/diagnostics/diagnostic-insert.ts";
import { validateDiagnosticCode } from "../../src/lib/diagnostics/normalize-diagnostic-code.ts";

const validCodes = [
  ["P0300", "P0300"],
  ["p0300", "P0300"],
  [" B1173 ", "B1173"],
  ["b1173 ", "B1173"],
  ["b1173", "B1173"],
  ["C1234", "C1234"],
  ["U0100", "U0100"],
  ["P17F0", "P17F0"],
  ["ABS-01", "ABS-01"],
  ["HONDA-B1173", "HONDA-B1173"],
  ["CUSTOM123", "CUSTOM123"],
  ["ANY-CODE", "ANY-CODE"],
];

test("normalizes and accepts all supported free-form code examples", () => {
  for (const [input, expected] of validCodes) {
    assert.equal(validateDiagnosticCode(input), expected, input);
  }
});

test("accepts the maximum 32-character code", () => {
  const code = "X".repeat(32);
  assert.equal(validateDiagnosticCode(code), code);
});

test("rejects blank, whitespace-only, and overlength codes", () => {
  assert.equal(validateDiagnosticCode(""), null);
  assert.equal(validateDiagnosticCode("    "), null);
  assert.equal(validateDiagnosticCode("X".repeat(33)), null);
});

test("builds the insert payload with nullable description and notes", () => {
  assert.deepEqual(
    buildDiagnosticInsert({
      vehicleId: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      code: "B1173",
      severity: "minor",
    }),
    {
      vehicle_id: "11111111-1111-4111-8111-111111111111",
      user_id: "22222222-2222-4222-8222-222222222222",
      code: "B1173",
      description: null,
      severity: "minor",
      status: "active",
      notes: null,
      resolved_at: null,
    },
  );
});
