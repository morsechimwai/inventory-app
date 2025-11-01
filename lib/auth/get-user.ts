import { stackServerApp } from "@/stack/server"

export async function getUserServer() {
  const user = await stackServerApp.getUser()

  return {
    user,
    userId: user?.id ?? null,
    email: user?.primaryEmail ?? null,
    name: user?.displayName ?? null,
    isLoggedIn: Boolean(user),
  }
}
