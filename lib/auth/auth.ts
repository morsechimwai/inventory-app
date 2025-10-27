// Next.js
import { redirect } from "next/navigation";

// Stack Auth
import { stackServerApp } from "@/stack/server";

export async function getCurrentUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/");
  }
  return user;
}
