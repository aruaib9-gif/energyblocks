// Creates (or resets the password of) a marketplace admin.
// Usage: npm run admin:create -- you@energyblocks.com "Your Name"
// The password is read from the ADMIN_NEW_PASSWORD env var or prompted for.
import { createClient } from "@libsql/client";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";

const [email, name = "Administrator"] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error('Usage: npm run admin:create -- you@example.com "Your Name"');
  process.exit(1);
}

let password = process.env.ADMIN_NEW_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Password (min 10 characters): ");
  rl.close();
}
if (!password || password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = `scrypt$${salt.toString("base64")}$${scryptSync(password, salt, 64).toString("base64")}`;

const db = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
await db.execute({
  sql: `INSERT INTO admins (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, name = excluded.name`,
  args: [randomUUID(), email.trim().toLowerCase(), name, hash, Date.now()],
});
console.log(`Admin ${email} is ready. Sign in at /admin/login`);
