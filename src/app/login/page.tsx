import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

function ProductMark() {
  return (
    <Link href="/" className="app-brand login-product-mark">
      <span className="app-brand__mark" aria-hidden="true">
        CM
      </span>
      <span className="app-brand__name">CAR MOD TRACKER</span>
    </Link>
  );
}

function LoginHero() {
  return (
    <section className="login-hero" aria-labelledby="login-hero-heading">
      <ProductMark />
      <p className="login-hero__eyebrow">PERSONAL BUILD SYSTEM / 01</p>
      <h1 id="login-hero-heading" className="login-hero__title">
        YOUR GARAGE.
        <br />
        YOUR BUILD.
        <br />
        <span>YOUR PROGRESS.</span>
      </h1>
      <p className="login-hero__copy">
        Organize vehicles, track modifications, and follow your investment.
      </p>

      <div className="login-hud" aria-hidden="true">
        <div className="login-hud__header">
          <span>BUILD OVERVIEW</span>
          <span>SYS / 01</span>
        </div>
        <div className="login-hud__visual" aria-hidden="true">
          <span className="login-hud__readout">VEHICLE / MODS / PROGRESS</span>
          <span className="login-hud__axis" />
          <span className="login-hud__ring">
            <span>BUILD<br />TRACKER</span>
          </span>
          <span className="login-hud__coordinates">00 / 01</span>
        </div>
        <div className="login-hud__footer" aria-hidden="true">
          <span>VEHICLES</span>
          <span>MODIFICATIONS</span>
          <span>INVESTMENT</span>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-layout">
        <LoginHero />
        <section className="login-entry" aria-label="Account sign in or sign up">
          <header className="login-mobile-header">
            <ProductMark />
            <p className="login-mobile-header__eyebrow">GARAGE ACCESS / 01</p>
            <h1>
              YOUR GARAGE.
              <br />
              YOUR BUILD.
            </h1>
            <p className="login-mobile-header__copy">
              Vehicles, modifications, investment — in one place.
            </p>
          </header>
          <LoginForm />
          <p className="login-entry__footer">
            VEHICLES / MODIFICATIONS / BUILD PROGRESS
          </p>
        </section>
      </div>
    </main>
  );
}
