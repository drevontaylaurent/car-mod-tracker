interface GarageHomeHeaderProps {
  onAddVehicle: () => void;
}

export function GarageHomeHeader({ onAddVehicle }: GarageHomeHeaderProps) {
  return (
    <header className="garage-home-header">
      <div className="garage-home-header__brand">
        <span className="garage-home-header__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="m7 7 18 18M25 7 7 25" stroke="currentColor" strokeWidth="2" />
            <path d="M4 12 12 4l16 16-8 8L4 12Z" stroke="currentColor" strokeOpacity=".28" />
          </svg>
        </span>
        <div>
          <p className="garage-home-header__name">Car Mod Tracker</p>
          <p className="garage-home-header__label">Garage / Fleet Bay</p>
        </div>
      </div>
      <button
        type="button"
        className="button-primary garage-home-header__add"
        onClick={onAddVehicle}
      >
        <span aria-hidden="true">+</span> Add Vehicle
      </button>
    </header>
  );
}
