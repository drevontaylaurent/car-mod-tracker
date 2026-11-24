"use client";

interface VehicleFieldsProps {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  nickname: string;
  decodeError: string;
  decodeMessage: string;
  isDecoding: boolean;
  onVinChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTrimChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
  onDecode: () => void;
}

export function VehicleFields({
  vin,
  year,
  make,
  model,
  trim,
  nickname,
  decodeError,
  decodeMessage,
  isDecoding,
  onVinChange,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
  onNicknameChange,
  onDecode,
}: VehicleFieldsProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 sm:col-span-2">
        <span className="field-label">VIN</span>
        <input
          name="vin"
          type="text"
          required
          minLength={17}
          maxLength={17}
          pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}"
          title="Enter all 17 VIN characters, excluding I, O, and Q."
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="17-character vehicle identification number"
          value={vin}
          onChange={(event) => onVinChange(event.target.value)}
          className="field-control uppercase placeholder:normal-case"
        />
        <button
          type="button"
          onClick={onDecode}
          disabled={isDecoding || vin.length !== 17}
          className="button-secondary mt-2"
        >
          {isDecoding ? "Decoding VIN..." : "Decode VIN"}
        </button>
        {decodeError && (
          <p role="alert" className="state-message mt-2" data-tone="error">
            {decodeError}
          </p>
        )}
        {decodeMessage && (
          <p role="status" className="state-message mt-2" data-tone="success">
            {decodeMessage}
          </p>
        )}
      </label>
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
    </div>
  );
}
