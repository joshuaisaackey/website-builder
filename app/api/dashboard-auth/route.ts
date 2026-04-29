import { NextResponse } from "next/server";
import {
  createDashboardSession,
  isAdminPasswordConfigured,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { password?: string };
  const password = String(body.password ?? "");

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  await createDashboardSession();
  return NextResponse.json({ ok: true });
}
