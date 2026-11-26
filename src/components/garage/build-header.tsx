import Link from "next/link";

interface BuildHeaderProps {
  isAddModOpen: boolean;
  onAddMod: () => void;
}

export function BuildHeader({ isAddModOpen, onAddMod }: BuildHeaderProps) {
  return (
    <header className="build-header">
      <div className="build-header__inner">
        <div className="build-header__brand">
          <span
            className="app-brand__mark build-header__mark"
            aria-hidden="true"
          >
            CM
          </span>
          <div className="build-header__identity">
            <p className="build-header__name">CAR MOD TRACKER</p>
            <p className="build-header__context">GARAGE / VEHICLE BUILD</p>
          </div>
        </div>
        <Link
          href="/garage"
          className="build-header__back"
          aria-label="Back to Garage"
        >
          <span aria-hidden="true">←</span>
        </Link>
        <button
          type="button"
          className="button-primary build-header__add-mod"
          aria-haspopup="dialog"
          aria-expanded={isAddModOpen}
          aria-controls={isAddModOpen ? "add-mod-dialog" : undefined}
          onClick={onAddMod}
        >
          + ADD MOD
        </button>
      </div>
    </header>
  );
}
