import Link from "next/link";
import { SignOutControl } from "@/components/auth/sign-out-control";

interface ApplicationHeaderProps {
  active?: "garage";
}

export function ApplicationHeader({ active }: ApplicationHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link
          href="/garage"
          className="app-brand"
          aria-label="Car Mod Tracker home"
        >
          <span className="app-brand__mark" aria-hidden="true">
            CM
          </span>
          <span className="app-brand__name">CAR MOD TRACKER</span>
        </Link>

        <nav aria-label="Primary navigation" className="app-nav">
          <Link
            href="/garage"
            className="app-nav__link"
            aria-current={active === "garage" ? "page" : undefined}
          >
            Garage
          </Link>
          <SignOutControl />
        </nav>
      </div>
    </header>
  );
}
