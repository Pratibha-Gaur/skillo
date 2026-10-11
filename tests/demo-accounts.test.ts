import { describe, expect, it } from "vitest";
import { isDemoAccount } from "../lib/demo-accounts";

describe("demo accounts", () => {
  it("recognises seeded demo accounts regardless of case or spaces", () => {
    expect(isDemoAccount("demo@skillo.app")).toBe(true);
    expect(isDemoAccount("  Maya@Skillo.app ")).toBe(true);
  });

  it("does not flag real accounts", () => {
    expect(isDemoAccount("someone@example.com")).toBe(false);
    expect(isDemoAccount("demo@skillo.app.evil.com")).toBe(false);
  });
});