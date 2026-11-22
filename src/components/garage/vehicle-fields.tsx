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
        <span className="block text-sm font-medium text-zinc-200">VIN</span>
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
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-600 focus:border-lime-400"
        />
        <button
          type="button"
          onClick={onDecode}
          disabled={isDecoding || vin.length !== 17}
          className="mt-2 h-10 rounded-lg border border-lime-400/30 px-4 text-sm font-medium text-lime-300 transition hover:bg-lime-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDecoding ? "Decoding VIN..." : "Decode VIN"}
        </button>
        {decodeError && (
          <p role="alert" className="mt-2 text-sm text-red-300">
            {decodeError}
          </p>
        )}
        {decodeMessage && (
          <p role="status" className="mt-2 text-sm text-lime-300">
            {decodeMessage}
          </p>
        )}
      </label>
      <label className="space-y-2">
        <span className="block text-sm font-medium text-zinc-200">Year</span>
        <input
          name="year"
          type="number"
          min={1886}
          max={currentYear + 1}
          placeholder="e.g. 2022"
          value={year}
          onChange={(event) => onYearChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
        />
      </label>
      <label className="space-y-2">
        <span className="block text-sm font-medium text-zinc-200">Make</span>
        <input
          name="make"
          maxLength={100}
          placeholder="e.g. Toyota"
          value={make}
          onChange={(event) => onMakeChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
        />
      </label>
      <label className="space-y-2">
        <span className="block text-sm font-medium text-zinc-200">Model</span>
        <input
          name="model"
          maxLength={100}
          placeholder="e.g. GR86"
          value={model}
          onChange={(event) => onModelChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
        />
      </label>
      <label className="space-y-2">
        <span className="block text-sm font-medium text-zinc-200">Trim</span>
        <input
          name="trim"
          maxLength={100}
          placeholder="e.g. Premium"
          value={trim}
          onChange={(event) => onTrimChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
        />
      </label>
      <label className="space-y-2 sm:col-span-2">
        <span className="block text-sm font-medium text-zinc-200">Nickname</span>
        <input
          name="nickname"
          maxLength={80}
          placeholder="Optional name for your build"
          value={nickname}
          onChange={(event) => onNicknameChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0e0f] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
        />
      </label>
    </div>
  );
}
