import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-5 py-12 text-white">
      <section className="surface-primary w-full max-w-md rounded-xl p-6 sm:p-8">
        <Link
          href="/login"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Back to sign in
        </Link>
        <h1 className="section-heading mt-8 text-2xl tracking-tight">
          Set a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Choose a password between 8 and 128 characters. Use the link from
          your password reset email to authorize this change.
        </p>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
