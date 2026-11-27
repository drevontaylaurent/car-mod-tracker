import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPasswordRecoveryLinkState } from "./password-recovery-link.ts";

describe("getPasswordRecoveryLinkState", () => {
  it("sends a recovery code to the existing callback", () => {
    assert.equal(getPasswordRecoveryLinkState("code=abc", ""), "exchange");
  });

  it("treats query or fragment errors as invalid, even with a code", () => {
    assert.equal(
      getPasswordRecoveryLinkState("code=abc&error=access_denied", ""),
      "invalid",
    );
    assert.equal(
      getPasswordRecoveryLinkState("code=abc", "#error_code=otp_expired"),
      "invalid",
    );
  });

  it("checks the existing session when no code or error is present", () => {
    assert.equal(getPasswordRecoveryLinkState("", ""), "verify");
  });
});
