import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getBuildPhaseMetrics,
  getBuildTimelineMetrics,
} from "../../src/lib/build-timeline.ts";

function phase(id, status, position = 0) {
  return {
    id,
    vehicle_id: "vehicle-1",
    user_id: "user-1",
    name: `Phase ${position}`,
    description: null,
    position,
    status,
    target_completion_date: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    completed_at: status === "completed" ? "2026-01-01T00:00:00.000Z" : null,
  };
}

function mod(id, phaseId, status, cost) {
  return {
    id,
    vehicle_id: "vehicle-1",
    user_id: "user-1",
    part_name: id,
    brand: null,
    category: "Engine",
    status,
    phase_id: phaseId,
    cost,
    install_date: null,
    notes: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

test("phase progress counts only installed mods and rounds percentages", () => {
  const firstPhase = phase("phase-1", "in_progress");
  const mods = [
    mod("installed-a", firstPhase.id, "Installed", 200),
    mod("installed-b", firstPhase.id, "Installed", 212.5),
    mod("ordered", firstPhase.id, "Ordered", 100),
  ];

  assert.deepEqual(getBuildPhaseMetrics(firstPhase, mods), {
    installedModCount: 2,
    totalModCount: 3,
    progressPercent: 67,
    trackedCost: 512.5,
  });
});

test("phase progress and cost are zero when it has no mods", () => {
  assert.deepEqual(getBuildPhaseMetrics(phase("phase-empty", "planned"), []), {
    installedModCount: 0,
    totalModCount: 0,
    progressPercent: 0,
    trackedCost: 0,
  });
});

test("overall progress counts completed phases and ignores unassigned mod cost", () => {
  const phases = [
    phase("phase-0", "completed"),
    phase("phase-1", "in_progress", 1),
    phase("phase-2", "planned", 2),
  ];
  const mods = [
    mod("assigned-a", "phase-0", "Installed", 325),
    mod("assigned-b", "phase-1", "Ordered", 412.5),
    mod("unassigned", null, "Wishlist", 900),
  ];

  assert.deepEqual(getBuildTimelineMetrics(phases, mods), {
    completedPhaseCount: 1,
    totalPhaseCount: 3,
    overallProgressPercent: 33,
    trackedPhaseCost: 737.5,
  });
});

test("zero phases produce no overall progress or tracked phase cost", () => {
  assert.deepEqual(getBuildTimelineMetrics([], [mod("unassigned", null, "Wishlist", 90)]), {
    completedPhaseCount: 0,
    totalPhaseCount: 0,
    overallProgressPercent: 0,
    trackedPhaseCost: 0,
  });
});
