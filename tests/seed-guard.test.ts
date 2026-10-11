import { describe, expect, it } from "vitest";
import {
  assertSeedIsSafe,
  describeDatabase,
  isLocalDatabase,
} from "../prisma/seed-guard";

describe("seed guard", () => {
  it("allows the default local SQLite file", () => {
    expect(assertSeedIsSafe({})).toBe("file:./prisma/dev.db");
    expect(assertSeedIsSafe({ DATABASE_URL: "" })).toBe("file:./prisma/dev.db");
  });

  it("allows Postgres running on this machine", () => {
    for (const url of [
      "postgresql://user:pw@localhost:5432/skillo",
      "postgresql://user:pw@127.0.0.1:5432/skillo",
      "postgresql://user:pw@[::1]:5432/skillo",
    ]) {
      expect(() => assertSeedIsSafe({ DATABASE_URL: url })).not.toThrow();
    }
  });

  it("refuses when NODE_ENV is production, even with the override", () => {
    expect(() => assertSeedIsSafe({ NODE_ENV: "production" })).toThrow(
      /production/,
    );
    expect(() =>
      assertSeedIsSafe({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://user:pw@localhost:5432/skillo",
        ALLOW_REMOTE_SEED: "true",
      }),
    ).toThrow(/production/);
  });

  it("refuses a remote database unless explicitly allowed", () => {
    const DATABASE_URL = "postgresql://user:pw@db.example.com/skillo";
    expect(() => assertSeedIsSafe({ DATABASE_URL })).toThrow(/not a local/);
    expect(() =>
      assertSeedIsSafe({ DATABASE_URL, ALLOW_REMOTE_SEED: "yes" }),
    ).toThrow(/not a local/);
    expect(assertSeedIsSafe({ DATABASE_URL, ALLOW_REMOTE_SEED: "true" })).toBe(
      "db.example.com/skillo",
    );
  });

  it("refuses a URL it cannot understand", () => {
    expect(isLocalDatabase("not a url")).toBe(false);
    expect(() => assertSeedIsSafe({ DATABASE_URL: "not a url" })).toThrow();
  });

  it("never prints the password or username", () => {
    const url = "postgresql://admin:SuperSecret@db.example.com/skillo";
    expect(describeDatabase(url)).toBe("db.example.com/skillo");
    let message = "";
    try {
      assertSeedIsSafe({ DATABASE_URL: url });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toContain("SuperSecret");
    expect(message).not.toContain("admin");
  });
});