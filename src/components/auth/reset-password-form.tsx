"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  checkPasswordRecoverySession,
  resetPassword,
} from "@/actions/auth";
import type { PasswordRecoveryFormState } from "@/types/auth";

type RecoveryStatus = "checking" | "authorized" | "invalid";
type ResetPasswordAction = (formData: FormData) => void;

const initialState: PasswordRecoveryFormState = { success: false };

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const hasInvalidLink =
    searchParams.has("error") || searchParams.has("error_code");
  const [recoveryStatus, setRecoveryStatus] =
    useState<RecoveryStatus>("checking");
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialState,
  );
  const isInvalid =
    hasInvalidLink ||
    recoveryStatus === "invalid" ||
    state.recoverySessionInvalid === true;

  useEffect(() => {
    if (hasInvalidLink) {
      return;
    }

    let active = true;

    checkPasswordRecoverySession()
      .then((result) => {
        if (active) {
          setRecoveryStatus(result.success ? "authorized" : "invalid");
        }
      })
      .catch((error: unknown) => {
        console.error("Could not verify password recovery session.", error);
        if (active) {
          setRecoveryStatus("invalid");
        }
      });

    return () => {
      active = false;
    };
  }, [hasInvalidLink]);

  if (isInvalid) {
    return <InvalidRecoveryLink />;
  }

  if (recoveryStatus === "checking") {
    return <CheckingRecoveryLink />;
  }

  if (state.success) {
    return <PasswordResetSuccess />;
  }

  return (
    <PasswordFields
      formAction={formAction}
      isPending={isPending}
      error={state.error}
    />
  );
}

function InvalidRecoveryLink() {
  return (
    <div
      role="alert"
      className="mt-8 space-y-4 rounded-lg border border-red-400/30 bg-red-400/10 p-5"
    >
      <div>
        <h2 className="font-semibold text-red-100">
          This reset link is invalid or expired.
        </h2>
        <p className="mt-2 text-sm leading-6 text-red-200">
          Request a new link to reset your password.
        </p>
      </div>
      <div className="flex flex-col gap-3 text-center text-sm">
        <Link
          href="/forgot-password"
          className="rounded-lg bg-lime-400 px-4 py-3 font-semibold text-[#111513] transition hover:bg-lime-300"
        >
          Request a new reset link
        </Link>
        <Link
          href="/login"
          className="text-zinc-300 transition hover:text-white"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

function CheckingRecoveryLink() {
  return (
    <p
      role="status"
      aria-live="polite"
      className="mt-8 rounded-lg border border-white/10 bg-[#111516] px-4 py-3 text-sm text-zinc-300"
    >
      Checking your password reset link...
    </p>
  );
}

function PasswordResetSuccess() {
  return (
    <div
      role="status"
      className="mt-8 space-y-4 rounded-lg border border-lime-400/20 bg-lime-400/10 p-5"
    >
      <p className="text-sm text-lime-100">Your password has been updated.</p>
      <Link
        href="/login"
        className="block rounded-lg bg-lime-400 px-4 py-3 text-center text-sm font-semibold text-[#111513] transition hover:bg-lime-300"
      >
        Return to Sign In
      </Link>
    </div>
  );
}

function PasswordFields({
  formAction,
  isPending,
  error,
}: {
  formAction: ResetPasswordAction;
  isPending: boolean;
  error?: string;
}) {
  return (
    <form action={formAction} className="mt-8 space-y-5">
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
          disabled={isPending}
          placeholder="At least 8 characters"
          className="h-12 w-full rounded-lg border border-white/10 bg-[#111516] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 disabled:opacity-60"
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
          disabled={isPending}
          placeholder="Enter your new password again"
          className="h-12 w-full rounded-lg border border-white/10 bg-[#111516] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 disabled:opacity-60"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-lime-400 px-4 text-sm font-semibold text-[#111513] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Please wait..." : "Update password"}
      </button>
    </form>
  );
}
