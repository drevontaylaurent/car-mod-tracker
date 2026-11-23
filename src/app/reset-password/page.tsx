import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0e0f] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#131819] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <Link
          href="/login"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Back to sign in
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
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
