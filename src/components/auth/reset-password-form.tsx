"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = { success: false };

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialState,
  );
  const hasInvalidLink =
    searchParams.has("error") || searchParams.has("error_code");

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {hasInvalidLink && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          This reset link is invalid or expired. Request a new one.
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-200"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          placeholder="At least 8 characters"
          className="h-12 w-full rounded-lg border border-white/10 bg-[#111516] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-zinc-200"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          placeholder="Enter your new password again"
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
        disabled={isPending || state.success}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-lime-400 px-4 text-sm font-semibold text-[#111513] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Please wait..." : "Update password"}
      </button>

      {state.success ? (
        <p className="text-center text-sm">
          <Link
            href="/garage"
            className="text-lime-300 transition hover:text-lime-200"
          >
            Continue to your garage
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-zinc-400 transition hover:text-white"
          >
            Request a new reset link
          </Link>
        </p>
      )}
    </form>
  );
}
