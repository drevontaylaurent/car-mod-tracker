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
