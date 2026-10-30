import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { friendlyLevel, initials, relativeTime, titleCase } from "@/lib/format";
import { cn } from "@/lib/cn";

describe("presentation helpers", () => {
  it("creates readable initials without exposing extra name parts", () => {
    expect(initials("Pratibha Gaur")).toBe("PG");
    expect(initials("  Maya   Kapoor Rao ")).toBe("MK");
  });

  it("uses friendly, confidence-based teaching levels", () => {
    expect(friendlyLevel("BASICS")).toBe("Can help with the basics");
    expect(friendlyLevel("COMFORTABLE")).toBe("Comfortable");
    expect(friendlyLevel("VERY_STRONG")).toBe("Very strong");
  });

  it("formats stored enum values for people", () => {
    expect(titleCase("EXCHANGE_REQUEST")).toBe("Exchange Request");
    expect(titleCase("GROWING")).toBe("Growing");
  });

  it("joins only active class names", () => {
    expect(cn("base", false, null, "active", undefined)).toBe("base active");
  });
});

describe("relativeTime", () => {
  const NOW = Date.parse("2026-01-15T12:00:00.000Z");
  const SECOND = 1_000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  // The helper uses fixed-duration months and years, not calendar arithmetic.
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  const dateAt = (offset: number) => new Date(NOW + offset);

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([0, -59 * SECOND, 59 * SECOND, -59_400, 59_400])(
    "treats an offset of %i milliseconds as just now",
    (offset) => {
      expect(relativeTime(dateAt(offset))).toBe("just now");
    },
  );

  it.each([
    {
      unit: "minute",
      offset: MINUTE,
      past: "1 minute ago",
      future: "in 1 minute",
    },
    {
      unit: "hour",
      offset: HOUR,
      past: "1 hour ago",
      future: "in 1 hour",
    },
    { unit: "day", offset: DAY, past: "yesterday", future: "tomorrow" },
    { unit: "week", offset: WEEK, past: "last week", future: "next week" },
    {
      unit: "month",
      offset: MONTH,
      past: "last month",
      future: "next month",
    },
    { unit: "year", offset: YEAR, past: "last year", future: "next year" },
  ])("formats past and future timestamps at the $unit boundary", (testCase) => {
    expect(relativeTime(dateAt(-testCase.offset))).toBe(testCase.past);
    expect(relativeTime(dateAt(testCase.offset))).toBe(testCase.future);
  });

  // Unit selection happens before rounding to the selected unit. These cases
  // protect that behavior, including rounded sub-second offsets.
  it.each([
    {
      unit: "minute",
      offset: MINUTE - 400,
      past: "1 minute ago",
      future: "in 1 minute",
    },
    {
      unit: "hour",
      offset: HOUR - SECOND,
      past: "60 minutes ago",
      future: "in 60 minutes",
    },
    {
      unit: "day",
      offset: DAY - SECOND,
      past: "24 hours ago",
      future: "in 24 hours",
    },
    {
      unit: "week",
      offset: WEEK - SECOND,
      past: "7 days ago",
      future: "in 7 days",
    },
    {
      unit: "month",
      offset: MONTH - SECOND,
      past: "4 weeks ago",
      future: "in 4 weeks",
    },
    {
      unit: "year",
      offset: YEAR - SECOND,
      past: "12 months ago",
      future: "in 12 months",
    },
  ])(
    "keeps timestamps just below the $unit boundary in the smaller unit",
    (testCase) => {
      expect(relativeTime(dateAt(-testCase.offset))).toBe(testCase.past);
      expect(relativeTime(dateAt(testCase.offset))).toBe(testCase.future);
    },
  );

  it.each([
    {
      unit: "minutes",
      offset: 91 * SECOND,
      past: "2 minutes ago",
      future: "in 2 minutes",
    },
    {
      unit: "hours",
      offset: 91 * MINUTE,
      past: "2 hours ago",
      future: "in 2 hours",
    },
    {
      unit: "days",
      offset: 37 * HOUR,
      past: "2 days ago",
      future: "in 2 days",
    },
    {
      unit: "weeks",
      offset: 11 * DAY,
      past: "2 weeks ago",
      future: "in 2 weeks",
    },
    {
      unit: "months",
      offset: 46 * DAY,
      past: "2 months ago",
      future: "in 2 months",
    },
    {
      unit: "years",
      offset: 549 * DAY,
      past: "2 years ago",
      future: "in 2 years",
    },
  ])(
    "rounds past and future offsets to the nearest whole number of $unit",
    (testCase) => {
      expect(relativeTime(dateAt(-testCase.offset))).toBe(testCase.past);
      expect(relativeTime(dateAt(testCase.offset))).toBe(testCase.future);
    },
  );

  it("reads the current clock on each call", () => {
    const createdAt = dateAt(0);
    expect(relativeTime(createdAt)).toBe("just now");

    vi.advanceTimersByTime(2 * HOUR);
    expect(relativeTime(createdAt)).toBe("2 hours ago");
  });
});
