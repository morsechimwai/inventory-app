// ./proxy.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

const PUBLIC_ROUTES = ["/"]; // คุณใช้ "/" เป็นจุดเริ่ม login ที่เดียว

const isPublic = (p: string) => PUBLIC_ROUTES.includes(p);
const isAsset = (p: string) =>
  p.startsWith("/_next/") ||
  p.startsWith("/assets/") ||
  p.startsWith("/images/") ||
  p.startsWith("/favicon") ||
  p.match(/\.(ico|png|jpg|svg)$/);

export async function proxy(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  if (isAsset(pathname)) return NextResponse.next();

  // ปล่อยเส้นทาง handler ให้ flow ของ Stack ทำงาน
  if (pathname.startsWith("/handler")) {
    const user = await stackServerApp.getUser();
    // อนุญาตให้ผู้ใช้ล็อกอินแล้วเข้าเฉพาะ sign-out ได้
    const isSignOut = pathname.startsWith("/handler/sign-out");
    if (user && !isSignOut) {
      return NextResponse.redirect(new URL("/dashboard", origin));
    }
    return NextResponse.next();
  }

  const user = await stackServerApp.getUser();

  // ยังไม่ล็อกอิน → พยายามเข้าโซน private ให้เด้งไป "/"
  if (!user && !isPublic(pathname)) {
    const to = new URL("/", origin);
    // เก็บ next ไว้ถ้าจะใช้ต่อ
    to.searchParams.set("next", pathname);
    return NextResponse.redirect(to);
  }

  // ล็อกอินแล้วแต่เข้าหน้า public → ส่งเข้าหน้า dashboard
  if (user && isPublic(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // public entry
    "/dashboard/:path*",
    "/inventory/:path*",
    // "/handler/:path*", // ให้ proxy เห็น เพื่อรีไดเร็กต์ authed → /dashboard (แต่ปล่อย sign-out)
  ],
};
