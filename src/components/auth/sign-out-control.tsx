"use client";

import { useActionState } from "react";
import { signOut } from "@/actions/auth";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = { success: true };

interface SignOutControlProps {
  label?: string;
}

export function SignOutControl({
  label = "Sign out",
}: SignOutControlProps) {
  const [state, formAction, isPending] = useActionState(signOut, initialState);

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="button-secondary"
        >
          {isPending ? "Signing out..." : label}
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
