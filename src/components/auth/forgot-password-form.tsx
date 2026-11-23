"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
          className="field-control"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="state-message"
          data-tone="error"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="state-message"
          data-tone="success"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="button-primary w-full"
      >
        {isPending ? "Please wait..." : "Send reset link"}
      </button>

      <p className="text-center text-sm">
        <Link
          href="/login"
          className="text-zinc-400 transition hover:text-white"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
