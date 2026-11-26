"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export interface ActionMenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

interface ActionMenuProps {
  label: string;
  items: ActionMenuItem[];
  disabled?: boolean;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  right: number;
}

const OPEN_EVENT = "action-menu-open";
const MENU_HEIGHT_ESTIMATE = 150;

export function ActionMenu({ label, items, disabled = false }: ActionMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const isOpen = position !== null;

  const close = useCallback((restoreFocus: boolean) => {
    setPosition(null);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  function open() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: menuId }));
    const right = Math.max(8, window.innerWidth - rect.right);
    const hasRoomBelow =
      window.innerHeight - rect.bottom > MENU_HEIGHT_ESTIMATE;
    setPosition(
      hasRoomBelow
        ? { top: rect.bottom + 4, right }
        : { bottom: window.innerHeight - rect.top + 4, right },
    );
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close(true);
      }
    }

    function handleOtherOpened(event: Event) {
      if (event instanceof CustomEvent && event.detail !== menuId) {
        close(false);
      }
    }

    const dismiss = () => close(false);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener(OPEN_EVENT, handleOtherOpened);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener(OPEN_EVENT, handleOtherOpened);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [close, isOpen, menuId]);

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
    );
    const index = buttons.findIndex((button) => button === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    buttons[(index + step + buttons.length) % buttons.length]?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? close(false) : open())}
        className="action-menu__trigger"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="action-menu__dots">
          <circle cx="5" cy="12" r="1.9" />
          <circle cx="12" cy="12" r="1.9" />
          <circle cx="19" cy="12" r="1.9" />
        </svg>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className="action-menu__list"
          style={position}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              data-destructive={item.destructive || undefined}
              onClick={() => {
                close(false);
                item.onSelect();
              }}
              className="action-menu__item"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
