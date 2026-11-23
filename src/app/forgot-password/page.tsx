import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
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
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Enter your email address and we&apos;ll send a link to reset your
          password.
        </p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
