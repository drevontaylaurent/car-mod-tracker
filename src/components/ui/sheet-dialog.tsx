"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface SheetDialogProps {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function SheetDialog({ eyebrow, title, onClose, children }: SheetDialogProps) {
  const headingId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    sheetRef.current
      ?.querySelector<HTMLElement>("input, select, textarea")
      ?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div
      className="specs-sheet__backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="specs-sheet"
      >
        <header className="specs-sheet__header">
          <div>
            <p className="specs-sheet__eyebrow">{eyebrow}</p>
            <h2 id={headingId} className="specs-sheet__title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="specs-sheet__close"
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
