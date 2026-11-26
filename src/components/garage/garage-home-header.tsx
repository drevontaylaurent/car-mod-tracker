interface GarageHomeHeaderProps {
  onAddVehicle: () => void;
}

export function GarageHomeHeader({ onAddVehicle }: GarageHomeHeaderProps) {
  return (
    <header className="garage-home-header">
      <div className="garage-home-header__brand">
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
