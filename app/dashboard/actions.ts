"use server";

import { redirect } from "next/navigation";
import { clearDashboardSession } from "@/lib/admin-auth";

export async function logoutFromDashboard() {
  await clearDashboardSession();
  redirect("/dashboard");
}
