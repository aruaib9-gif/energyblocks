// Creates (or resets the password of) a marketplace admin.
// Usage: npm run admin:create -- you@energyblocks.com "Your Name"
// The password is read from the ADMIN_NEW_PASSWORD env var or prompted for.
import { MongoClient } from "mongodb";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

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

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (add it to .env.local).");
  process.exit(1);
}
const client = new MongoClient(process.env.MONGODB_URI);
const admins = client.db(process.env.MONGODB_DB || "energyblocks").collection("admins");
await admins.createIndex({ email: 1 }, { unique: true });
await admins.updateOne(
  { email: email.trim().toLowerCase() },
  {
    $set: { name, passwordHash: hash },
    $setOnInsert: { _id: randomUUID(), email: email.trim().toLowerCase(), createdAt: Date.now() },
  },
  { upsert: true },
);
await client.close();
console.log(`Admin ${email} is ready. Sign in at /admin/login`);
