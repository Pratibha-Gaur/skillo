import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
await client.executeMultiple(schema);
await client.close();
console.log("Skillo database schema is ready.");
