"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "@/actions/auth";
import type { AuthFormState } from "@/types/auth";

type AuthMode = "sign-in" | "sign-up";

const initialAuthFormState: AuthFormState = {
  success: false,
};

function AuthForm({ mode }: { mode: AuthMode }) {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialAuthFormState,
  );
  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="intent" value={mode} />
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
      <div className="space-y-2">
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
        <div className="-mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-lime-300 transition hover:text-lime-200"
          >
            Forgot password?
          </Link>
        </div>
      )}

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
        {isPending
          ? "Please wait..."
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </button>
    </form>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const isSignUp = mode === "sign-up";

  return (
    <div className="surface-primary w-full max-w-md rounded-xl p-6 sm:p-8">
      <div className="grid grid-cols-2 rounded-lg bg-surface-inset p-1">
        {(["sign-in", "sign-up"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${
              mode === option
                ? "bg-surface-secondary text-white"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {option === "sign-in" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <div className="mt-7">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {isSignUp
            ? "Start tracking every detail of your build."
            : "Sign in to pick up where your build left off."}
        </p>
      </div>

      <div key={mode}>
        <AuthForm mode={mode} />
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-zinc-500">
        {isSignUp
          ? "By creating an account, you agree to keep your build details yours."
          : "Your garage, parts, and build notes stay in one place."}
      </p>
    </div>
  );
}
