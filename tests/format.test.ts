import { describe, expect, it } from "vitest";
import { friendlyLevel, initials, titleCase } from "@/lib/format";
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
