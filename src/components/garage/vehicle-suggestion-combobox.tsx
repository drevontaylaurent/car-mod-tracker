"use client";

import { useId, useState } from "react";
import type { KeyboardEvent, FocusEvent } from "react";
import type { SuggestionStatus } from "@/components/garage/use-vehicle-suggestions";

interface VehicleSuggestionComboboxProps {
  id: string;
  label: string;
  name: string;
  value: string;
  placeholder: string;
  maxLength: number;
  minQueryLength: number;
  suggestions: string[];
  status: SuggestionStatus;
  onChange: (value: string) => void;
}

export function VehicleSuggestionCombobox({
  id,
  label,
  name,
  value,
  placeholder,
  maxLength,
  minQueryLength,
  suggestions,
  status,
  onChange,
}: VehicleSuggestionComboboxProps) {
  const generatedId = useId();
  const listId = `${id}-suggestions-${generatedId}`;
  const statusId = `${id}-status-${generatedId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const query = value.trim().toLowerCase();
  const matchingSuggestions =
    query.length >= minQueryLength
      ? suggestions
          .filter((suggestion) => suggestion.toLowerCase().includes(query))
          .sort(
            (left, right) =>
              Number(right.toLowerCase().startsWith(query)) -
              Number(left.toLowerCase().startsWith(query)),
          )
          .slice(0, 8)
      : [];
  const showList = isOpen && matchingSuggestions.length > 0;
  const showStatus = isOpen && query.length >= minQueryLength &&
    (status === "loading" || status === "error" ||
      (status === "ready" && matchingSuggestions.length === 0));
  const statusMessage =
    status === "loading"
      ? "Loading NHTSA suggestions…"
      : status === "error"
        ? "Suggestions are unavailable. You can enter this manually."
        : "No matching suggestions. You can enter this manually.";

  function chooseSuggestion(suggestion: string) {
    onChange(suggestion);
    setActiveIndex(-1);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && matchingSuggestions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) =>
        index >= matchingSuggestions.length - 1 ? 0 : index + 1,
      );
    } else if (event.key === "ArrowUp" && matchingSuggestions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) =>
        index <= 0 ? matchingSuggestions.length - 1 : index - 1,
      );
    } else if (
      event.key === "Enter" &&
      showList &&
      matchingSuggestions[activeIndex]
    ) {
      event.preventDefault();
      chooseSuggestion(matchingSuggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="vehicle-suggestion-field" onBlur={handleBlur}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-activedescendant={
          showList && activeIndex >= 0
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
        aria-describedby={showStatus ? statusId : undefined}
        autoComplete="off"
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          setActiveIndex(-1);
          setIsOpen(true);
          onChange(event.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="field-control vehicle-suggestion-input"
      />
      {showList && (
        <ul id={listId} role="listbox" className="vehicle-suggestion-list">
          {matchingSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className="vehicle-suggestion-option"
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseSuggestion(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {showStatus && (
        <p id={statusId} role="status" aria-live="polite" className="vehicle-suggestion-status">{statusMessage}</p>
      )}
    </div>
  );
}
