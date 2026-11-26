import Link from "next/link";

export function GarageBottomNavigation() {
  return (
    <nav className="garage-home-nav" aria-label="Home hub navigation">
      <button type="button" disabled aria-disabled="true">
        Profile
        <span className="sr-only"> — coming later</span>
      </button>
      <Link href="/garage" aria-current="page">
        <span aria-hidden="true">●</span> Garage
      </Link>
      <button type="button" disabled aria-disabled="true">
        Community
        <span className="sr-only"> — coming later</span>
      </button>
    </nav>
  );
}
