"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "@/actions/auth";
import type { AuthFormState } from "@/types/auth";

export type AuthMode = "sign-in" | "sign-up";

const initialAuthFormState: AuthFormState = {
  success: false,
};

export function LoginCredentialsForm({ mode }: { mode: AuthMode }) {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialAuthFormState,
  );
  const isSignUp = mode === "sign-up";

  return (
    <form
      action={formAction}
      className="login-credentials-form"
      aria-busy={isPending}
    >
      <input type="hidden" name="intent" value={mode} />
      <div className="login-credentials-form__field">
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
      <div className="login-credentials-form__field">
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          maxLength={128}
          placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
          className="field-control"
        />
      </div>

      {!isSignUp && (
        <div className="login-credentials-form__recovery">
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
      )}

      {state.error && (
        <p
          role="alert"
          className="state-message login-credentials-form__message"
          data-tone="error"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="state-message login-credentials-form__message"
          data-tone="success"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="button-primary login-credentials-form__submit"
      >
        <span aria-live="polite">
          {isPending
            ? isSignUp
              ? "Creating account..."
              : "Signing in..."
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </span>
        {!isPending && <span aria-hidden="true">→</span>}
      </button>
    </form>
  );
}
