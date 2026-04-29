import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "dashboard_auth";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const ADMIN_SESSION_SCOPE = "dashboard-access";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("Missing required environment variable: ADMIN_PASSWORD");
  }

  return password;
}

function createSessionToken(password: string) {
  return createHmac("sha256", password).update(ADMIN_SESSION_SCOPE).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function isValidAdminPassword(password: string) {
  return safeEqual(password, getAdminPassword());
}

export async function isDashboardAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  const expectedToken = createSessionToken(getAdminPassword());
  return safeEqual(sessionToken, expectedToken);
}

export async function createDashboardSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(getAdminPassword()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearDashboardSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
