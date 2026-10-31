import "server-only";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { count, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { db } from "./db";
import { admins } from "./schema";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

const COOKIE = "eb_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function sessionSecret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET (32+ chars) must be set in production.");
  return "dev-only-session-secret-change-me-0000000000";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

async function checkPassword(password: string, stored: string) {
  const [, salt, key] = stored.split("$");
  if (!salt || !key) return false;
  const expected = Buffer.from(key, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

/**
 * Open admin login for local development. Never active in production builds, whatever the
 * environment says. Set ADMIN_OPEN_LOGIN=0 to test the real sign-in locally.
 */
export const openLogin = () => process.env.NODE_ENV !== "production" && process.env.ADMIN_OPEN_LOGIN !== "0";

/**
 * Signs an admin in. If no admin account exists yet, the first sign-in matching
 * ADMIN_EMAIL / ADMIN_PASSWORD from the environment creates it.
 */
export async function signIn(email: string, password: string) {
  email = email.trim().toLowerCase();
  let [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

  if (!admin) {
    const [{ n }] = await db.select({ n: count() }).from(admins);
    const bootEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const bootPassword = process.env.ADMIN_PASSWORD;
    if (n === 0 && bootEmail && bootPassword && email === bootEmail && password === bootPassword) {
      [admin] = await db
        .insert(admins)
        .values({ email, name: "Administrator", passwordHash: await hashPassword(password) })
        .returning();
    }
  }
  if (openLogin()) {
    // Development convenience: any email/password signs in, creating the account on first use.
    if (!email.includes("@") || !password) return false;
    admin ??= (
      await db
        .insert(admins)
        .values({ email, name: email.split("@")[0], passwordHash: await hashPassword(password) })
        .returning()
    )[0];
  } else {
    // Same work whether or not the account exists, so timing doesn't reveal valid emails.
    const ok = admin ? await checkPassword(password, admin.passwordHash) : (await hashPassword(password), false);
    if (!admin || !ok) return false;
  }

  const payload = Buffer.from(JSON.stringify({ sub: admin.id, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin() {
  // Session expiry depends on the current time, so this is always a request-time read.
  await connection();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  let data: { sub?: string; exp?: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
  if (!data.sub || !data.exp || data.exp < Date.now()) return null;
  const [admin] = await db
    .select({ id: admins.id, email: admins.email, name: admins.name })
    .from(admins)
    .where(eq(admins.id, data.sub))
    .limit(1);
  return admin ?? null;
}

/** Call at the top of every admin page, action and route. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function createAdmin(input: { email: string; name: string; password: string }) {
  await db.insert(admins).values({
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
  });
}

export async function changePassword(adminId: string, current: string, next: string) {
  const [admin] = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
  if (!admin || !(await checkPassword(current, admin.passwordHash))) return false;
  await db.update(admins).set({ passwordHash: await hashPassword(next) }).where(eq(admins.id, adminId));
  return true;
}
