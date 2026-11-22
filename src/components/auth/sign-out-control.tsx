"use client";

import { useActionState } from "react";
import { signOut } from "@/actions/auth";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = { success: true };

export function SignOutControl() {
  const [state, formAction, isPending] = useActionState(signOut, initialState);

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-lg border border-white/15 px-4 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Signing out..." : "Sign out"}
        </button>
      </form>
      {!state.success && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
    </div>
  );
}
