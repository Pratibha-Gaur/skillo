// Safety checks for the seed script.
//
// The seed deletes EVERY row in the database before inserting demo data.
// That is fine for a local development database and a disaster anywhere else,
// so the seed asks this module for permission before it touches anything.
// Rule of thumb: when in doubt, refuse ("fail closed").

export type SeedEnv = {
  NODE_ENV?: string;
  DATABASE_URL?: string;
  ALLOW_REMOTE_SEED?: string;
};

const DEFAULT_DATABASE_URL = "file:./prisma/dev.db";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/**
 * A short, safe-to-print description of a database URL.
 * It never includes the username or password.
 */
export function describeDatabase(url: string): string {
  if (url.startsWith("file:")) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return "an unrecognised database URL";
  }
}

/** True for a local SQLite file or a Postgres running on this machine. */
export function isLocalDatabase(url: string): boolean {
  if (url.startsWith("file:")) return true;
  try {
    return LOCAL_HOSTNAMES.has(new URL(url).hostname);
  } catch {
    return false; // can't understand the URL, so do not treat it as local
  }
}

/**
 * Throws if it is not safe to wipe and seed this database.
 * Returns a printable description of the database when it is safe.
 */
export function assertSeedIsSafe(env: SeedEnv): string {
  const url = env.DATABASE_URL || DEFAULT_DATABASE_URL;
  const target = describeDatabase(url);

  if (env.NODE_ENV === "production") {
    throw new Error(
      'Refusing to seed: NODE_ENV is "production". The seed deletes all data and creates demo accounts with a known password.',
    );
  }

  if (!isLocalDatabase(url) && env.ALLOW_REMOTE_SEED !== "true") {
    throw new Error(
      `Refusing to seed ${target}: it is not a local database. The seed deletes all data. If you are sure this is a throwaway database, run it again with ALLOW_REMOTE_SEED=true.`,
    );
  }

  return target;
}