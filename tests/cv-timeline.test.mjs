import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBranchLayout, parseTimelineDate } from '../src/lib/cv-timeline.js';

const NOW = new Date(2026, 8, 12);

test('parses every date format used by the CV', () => {
  assert.deepEqual(parseTimelineDate('May – Aug 2023', NOW), {
    startMonth: 2023 * 12 + 4,
    endMonth: 2023 * 12 + 7,
    startYear: 2023,
    endYear: 2023,
    isPresent: false,
    isInstant: false
  });

  assert.equal(parseTimelineDate('Oct 2021', NOW).isInstant, true);
  assert.equal(parseTimelineDate('Sep 2025 – Present', NOW).endMonth, 2026 * 12 + 8);
  assert.equal(parseTimelineDate('2026 – Present', NOW).startMonth, 2026 * 12);
});

test('forks nested branches from the deepest active branch', () => {
  const layout = buildBranchLayout([
    { id: 'b1', date: 'Sep 2021 – Aug 2023' },
    { id: 'b2', date: 'Oct 2021 – Jan 2022' },
    { id: 'b3', date: 'Feb 2022 – Nov 2023' }
  ], NOW);

  const byId = Object.fromEntries(layout.map((entry) => [entry.id, entry]));

  assert.equal(byId.b1.lane, 1);
  assert.equal(byId.b2.lane, 2);
  assert.equal(byId.b2.startParentLane, 1);
  assert.equal(byId.b2.endParentLane, 1);
  assert.equal(byId.b3.lane, 2);
  assert.equal(byId.b3.startParentLane, 1);
  assert.equal(byId.b3.endParentLane, 0);
});

test('keeps ongoing nested branches open', () => {
  const layout = buildBranchLayout([
    { id: 'sda', date: 'Sep 2025 – Present' },
    { id: 'phd', date: '2026 – Present' }
  ], NOW);

  const byId = Object.fromEntries(layout.map((entry) => [entry.id, entry]));

  assert.equal(byId.sda.lane, 1);
  assert.equal(byId.phd.lane, 2);
  assert.equal(byId.phd.startParentLane, 1);
  assert.equal(byId.phd.isPresent, true);
});

test('reuses the first lane after an earlier branch has merged', () => {
  const layout = buildBranchLayout([
    { id: 'internship', date: 'May – Aug 2023' },
    { id: 'research', date: 'Jan 2024 – Aug 2025' }
  ], NOW);

  assert.equal(layout.find((entry) => entry.id === 'internship').lane, 1);
  assert.equal(layout.find((entry) => entry.id === 'research').lane, 1);
});
