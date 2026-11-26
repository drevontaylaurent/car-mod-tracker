"use client";

export type AddModMode = "url" | "manual";

interface AddModModeToggleProps {
  mode: AddModMode;
  onModeChange: (mode: AddModMode) => void;
}

const MODES: readonly { id: AddModMode; label: string }[] = [
  { id: "url", label: "URL Auto-Fill" },
  { id: "manual", label: "Manual Entry" },
];

export function AddModModeToggle({ mode, onModeChange }: AddModModeToggleProps) {
  return (
    <div className="add-mod__toggle" role="group" aria-label="Entry mode">
      {MODES.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={mode === option.id}
          onClick={() => onModeChange(option.id)}
          className="add-mod__toggle-option"
        >
          {mode === option.id && <span aria-hidden="true">● </span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
