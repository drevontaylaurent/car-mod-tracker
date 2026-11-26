import Link from "next/link";

interface GarageBottomNavigationProps {
  active?: "profile" | "garage";
}

export function GarageBottomNavigation({
  active = "garage",
}: GarageBottomNavigationProps) {
  return (
    <nav className="garage-home-nav" aria-label="Home hub navigation">
      <Link
        href="/profile"
        aria-current={active === "profile" ? "page" : undefined}
      >
        {active === "profile" && <span aria-hidden="true">●</span>} Profile
      </Link>
      <Link
        href="/garage"
        aria-current={active === "garage" ? "page" : undefined}
      >
        {active === "garage" && <span aria-hidden="true">●</span>} Garage
      </Link>
      <button type="button" disabled aria-disabled="true">
        Community
        <span className="sr-only"> — coming later</span>
      </button>
    </nav>
  );
}
