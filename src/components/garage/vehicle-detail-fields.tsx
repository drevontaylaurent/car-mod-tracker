interface VehicleDetailFieldsProps {
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
      <label className="space-y-2">
        <span className="field-label">Trim</span>
        <input
          name="trim"
          maxLength={100}
          placeholder="e.g. Premium"
          value={trim}
          onChange={(event) => onTrimChange(event.target.value)}
          className="field-control"
        />
      </label>
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
