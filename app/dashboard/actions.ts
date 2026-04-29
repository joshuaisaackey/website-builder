"use server";

import { redirect } from "next/navigation";
import {
  clearDashboardSession,
  createDashboardSession,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function loginToDashboard(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isValidAdminPassword(password)) {
    redirect("/dashboard?error=invalid-password");
  }

  await createDashboardSession();
  redirect("/dashboard");
}

export async function logoutFromDashboard() {
  await clearDashboardSession();
  redirect("/dashboard");
}
