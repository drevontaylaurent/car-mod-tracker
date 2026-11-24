import { VehicleSuggestionCombobox } from "@/components/garage/vehicle-suggestion-combobox";
import { useVehicleSuggestions } from "@/components/garage/use-vehicle-suggestions";

interface VehicleDetailFieldsProps {
  enableSuggestions: boolean;
  year: string;
  make: string;
  model: string;
  trim: string;
  nickname: string;
  currentYear: number;
  onYearChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTrimChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
}

export function VehicleDetailFields({
  enableSuggestions,
  year,
  make,
  model,
  trim,
  nickname,
  currentYear,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
  onNicknameChange,
}: VehicleDetailFieldsProps) {
  const suggestions = useVehicleSuggestions(year, make, enableSuggestions);

  return (
    <>
      <label className="space-y-2">
        <span className="field-label">Year</span>
        <input
          name="year"
          type="number"
          min={1886}
          max={currentYear + 1}
          placeholder="e.g. 2022"
          value={year}
          onChange={(event) => onYearChange(event.target.value)}
          className="field-control"
        />
      </label>
      {enableSuggestions ? (
        <VehicleSuggestionCombobox
          id="vehicle-make"
          label="Make"
          name="make"
          value={make}
          placeholder="e.g. Toyota"
          maxLength={100}
          minQueryLength={2}
          suggestions={suggestions.make.suggestions}
          status={suggestions.make.status}
          onChange={onMakeChange}
        />
      ) : (
        <label className="space-y-2">
          <span className="field-label">Make</span>
          <input
            name="make"
            maxLength={100}
            placeholder="e.g. Toyota"
            value={make}
            onChange={(event) => onMakeChange(event.target.value)}
            className="field-control"
          />
        </label>
      )}
      {enableSuggestions ? (
        <VehicleSuggestionCombobox
          id="vehicle-model"
          label="Model"
          name="model"
          value={model}
          placeholder="e.g. Camry"
          maxLength={100}
          minQueryLength={1}
          suggestions={suggestions.model.suggestions}
          status={suggestions.model.status}
          onChange={onModelChange}
        />
      ) : (
        <label className="space-y-2">
          <span className="field-label">Model</span>
          <input
            name="model"
            maxLength={100}
            placeholder="e.g. GR86"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className="field-control"
          />
        </label>
      )}
      <div className="space-y-2">
        <label htmlFor="vehicle-trim" className="field-label">
          Trim
        </label>
        <input
          id="vehicle-trim"
          name="trim"
          maxLength={100}
          placeholder="e.g. Premium"
          value={trim}
          aria-describedby={
            enableSuggestions ? "vehicle-trim-guidance" : undefined
          }
          onChange={(event) => onTrimChange(event.target.value)}
          className="field-control"
        />
        {enableSuggestions && (
          <p
            id="vehicle-trim-guidance"
            className="text-sm text-zinc-400"
          >
            NHTSA does not provide reliable Trim suggestions for this vehicle.
            Enter it manually.
          </p>
        )}
      </div>
      <label className="space-y-2 sm:col-span-2">
        <span className="field-label">Nickname</span>
        <input
          name="nickname"
          maxLength={80}
          placeholder="Optional name for your build"
          value={nickname}
          onChange={(event) => onNicknameChange(event.target.value)}
          className="field-control"
        />
      </label>
    </>
  );
}
