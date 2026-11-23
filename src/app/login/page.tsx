import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-transparent px-5 py-12 text-white">
      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_440px] lg:gap-16">
        <section className="hidden lg:block">
          <Link href="/" className="app-brand">
            <span className="app-brand__mark" aria-hidden="true">
              CM
            </span>
            <span className="app-brand__name">
              CAR MOD TRACKER
            </span>
          </Link>
          <p className="technical-label mt-16 text-accent">
            Performance build systems / 01
          </p>
          <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[1.12] tracking-tight text-white">
            Your build.
            <br />
            Every detail.
            <br />
            <span className="text-accent">One garage.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
            Keep your vehicles, upgrades, and maintenance notes together. Build
            with a plan and remember every part of the journey.
          </p>
          <div className="technical-label mt-12 flex items-center gap-3">
            <span className="h-px w-10 bg-accent" />
            MADE FOR PEOPLE WHO DRIVE THEIR BUILDS
          </div>
        </section>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <Link href="/" className="app-brand mb-8 lg:hidden">
            <span className="app-brand__mark" aria-hidden="true">
              CM
            </span>
            <span className="app-brand__name">
              CAR MOD TRACKER
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
