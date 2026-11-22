"use client";

import { useState } from "react";
import { useActionState } from "react";
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
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-200"
        >
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
          className="h-12 w-full rounded-lg border border-white/10 bg-[#111516] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-200"
        >
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
          className="h-12 w-full rounded-lg border border-white/10 bg-[#111516] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="rounded-lg border border-lime-400/20 bg-lime-400/10 px-4 py-3 text-sm text-lime-200"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-lime-400 px-4 text-sm font-semibold text-[#111513] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#131819] p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="grid grid-cols-2 rounded-lg bg-[#0c1011] p-1">
        {(["sign-in", "sign-up"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${
              mode === option
                ? "bg-[#252c2d] text-white shadow"
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
