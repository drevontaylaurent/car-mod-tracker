import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0e0f] px-5 py-12 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-lime-400/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 bottom-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl"
      />

      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_440px] lg:gap-16">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-sm font-black tracking-tight text-[#0b0e0f]">
              CM
            </span>
            <span className="text-sm font-semibold tracking-[0.18em] text-zinc-200">
              MOD TRACKER
            </span>
          </Link>
          <p className="mt-16 text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">
            Built for the road ahead
          </p>
          <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[1.12] tracking-tight text-white">
            Your build.
            <br />
            Every detail.
            <br />
            <span className="text-lime-300">One garage.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
            Keep your vehicles, upgrades, and maintenance notes together. Build
            with a plan and remember every part of the journey.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-zinc-500">
            <span className="h-px w-10 bg-lime-400/60" />
            MADE FOR PEOPLE WHO DRIVE THEIR BUILDS
          </div>
        </section>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-sm font-black tracking-tight text-[#0b0e0f]">
              CM
            </span>
            <span className="text-xs font-semibold tracking-[0.18em] text-zinc-200">
              MOD TRACKER
            </span>
          </Link>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-zinc-600">
            Keep your build moving.
          </p>
        </div>
      </div>
    </main>
  );
}
