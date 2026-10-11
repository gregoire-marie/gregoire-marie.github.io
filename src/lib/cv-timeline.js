const MONTH_INDEX = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11
};

function monthNumber(year, month) {
  return year * 12 + month;
}

function readDatePart(value, { fallbackYear, rangeEnd = false } = {}) {
  const part = value.trim();
  const yearMatch = part.match(/\b(?:19|20)\d{2}\b/);
  const month = MONTH_INDEX[part.slice(0, 3).toLowerCase()];
  const year = Number(yearMatch?.[0] ?? fallbackYear);

  if (!Number.isFinite(year)) {
    throw new Error(`Timeline date is missing a year: "${value}"`);
  }

  return {
    year,
    month: month ?? (rangeEnd ? 11 : 0)
  };
}

/**
 * Parses the human-readable dates used by the CV JSON files into month indices.
 * Missing start years inherit the end year (for example, "May – Aug 2023").
 */
export function parseTimelineDate(value, now = new Date()) {
  const parts = value.trim().split(/\s+[–—-]\s+/);
  const startPart = parts[0];
  const endPart = parts[1];
  const isRange = Boolean(endPart);
  const isPresent = isRange && /^present$/i.test(endPart.trim());

  let end;
  if (isPresent) {
    end = { year: now.getFullYear(), month: now.getMonth() };
  } else if (isRange) {
    end = readDatePart(endPart, { rangeEnd: true });
  }

  const start = readDatePart(startPart, { fallbackYear: end?.year });
  const resolvedEnd = end ?? start;
  const startMonth = monthNumber(start.year, start.month);
  const endMonth = monthNumber(resolvedEnd.year, resolvedEnd.month);

  if (endMonth < startMonth) {
    throw new Error(`Timeline date ends before it starts: "${value}"`);
  }

  return {
    startMonth,
    endMonth,
    startYear: start.year,
    endYear: resolvedEnd.year,
    isPresent,
    isInstant: startMonth === endMonth
  };
}

function deepest(entries) {
  return entries.reduce((selected, entry) => (
    !selected || entry.lane > selected.lane ? entry : selected
  ), undefined);
}

/**
 * Builds Git-like lanes for one independent side of the CV tree.
 *
 * A new interval forks from the deepest branch active at its start. It merges
 * into the deepest older branch that contains its end, or the main line when
 * no such branch remains. Ongoing branches intentionally stay open.
 */
export function buildBranchLayout(entries, now = new Date()) {
  const chronological = entries
    .map((entry, sourceIndex) => ({
      ...entry,
      sourceIndex,
      ...parseTimelineDate(entry.date, now)
    }))
    .sort((a, b) => (
      a.startMonth - b.startMonth
      || b.endMonth - a.endMonth
      || a.sourceIndex - b.sourceIndex
    ));

  const placed = [];

  for (const entry of chronological) {
    const activeAtStart = placed.filter((candidate) => (
      candidate.startMonth <= entry.startMonth
      && candidate.endMonth >= entry.startMonth
    ));
    const startParent = deepest(activeAtStart);

    placed.push({
      ...entry,
      lane: (startParent?.lane ?? 0) + 1,
      startParentLane: startParent?.lane ?? 0,
      endParentLane: 0
    });
  }

  for (const entry of placed) {
    if (entry.isPresent) continue;

    const containingAtEnd = placed.filter((candidate) => (
      candidate !== entry
      && candidate.lane < entry.lane
      && candidate.startMonth <= entry.startMonth
      && candidate.endMonth >= entry.endMonth
    ));
    entry.endParentLane = deepest(containingAtEnd)?.lane ?? 0;
  }

  return placed
    .sort((a, b) => b.startMonth - a.startMonth || a.lane - b.lane)
    .map((entry, renderIndex) => ({ ...entry, renderIndex }));
}

export function monthToDate(month) {
  return new Date(Math.floor(month / 12), month % 12, 1);
}
