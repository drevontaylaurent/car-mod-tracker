const sections = [
  { id: "inventory", label: "MOD INVENTORY", available: true },
  { id: "obd", label: "OBD-II", available: false },
  { id: "timeline", label: "BUILD TIMELINE", available: false },
] as const;

export function BuildSectionNavigation() {
  return (
    <nav className="open-build__navigation" aria-label="Open Build sections">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          className="open-build__nav-item"
          aria-current={section.available ? "page" : undefined}
          disabled={!section.available}
        >
          <span>{section.label}</span>
          {section.available ? (
            <span className="open-build__nav-state">ACTIVE</span>
          ) : (
            <span className="open-build__nav-state">COMING SOON</span>
          )}
        </button>
      ))}
    </nav>
  );
}
