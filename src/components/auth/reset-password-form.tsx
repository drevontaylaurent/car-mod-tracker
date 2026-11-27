"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  checkPasswordRecoverySession,
  resetPassword,
} from "@/actions/auth";
import { getPasswordRecoveryLinkState } from "@/lib/password-recovery-link";
import type { PasswordRecoveryFormState } from "@/types/auth";

type RecoveryStatus = "checking" | "authorized" | "invalid";
type ResetPasswordAction = (formData: FormData) => void;

const initialState: PasswordRecoveryFormState = { success: false };

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recoveryQuery = searchParams.toString();
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
    if (!state.success) {
      return;
    }

    const timeout = window.setTimeout(
      () => router.replace("/login"),
      state.signOutFailed ? 7000 : 2000,
    );
    return () => window.clearTimeout(timeout);
  }, [router, state.signOutFailed, state.success]);

  useEffect(() => {
    if (hasInvalidLink) {
      return;
    }

    const linkState = getPasswordRecoveryLinkState(
      recoveryQuery,
      window.location.hash,
    );
    if (linkState === "exchange") {
      window.location.replace(`/auth/callback?${recoveryQuery}`);
      return;
    }

    let active = true;

    const sessionCheck = linkState === "invalid"
      ? Promise.resolve({ success: false })
      : checkPasswordRecoverySession();

    sessionCheck
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
  }, [hasInvalidLink, recoveryQuery]);

  if (isInvalid) {
    return <InvalidRecoveryLink />;
  }

  if (recoveryStatus === "checking") {
    return <CheckingRecoveryLink />;
  }

  if (state.success) {
    return <PasswordResetSuccess message={state.message} />;
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
      className="state-message mt-8 space-y-4 p-5"
      data-tone="error"
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
      className="state-message mt-8"
      data-tone="loading"
    >
      Checking your password reset link...
    </p>
  );
}

function PasswordResetSuccess({ message }: { message?: string }) {
  return (
    <div
      role="status"
      className="state-message mt-8 space-y-4 p-5"
      data-tone="success"
    >
      <p className="text-sm text-lime-100">
        {message}
      </p>
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
        <label htmlFor="password" className="field-label">
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
          className="field-control"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="field-label">
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
          className="field-control"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="state-message"
          data-tone="error"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="button-primary w-full"
      >
        {isPending ? "Please wait..." : "Update password"}
      </button>
    </form>
  );
}
