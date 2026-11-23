import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
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
