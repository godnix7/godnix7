import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (hostname !== "admin.nischay.tech" && hostname !== "admin.localhost") return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (pathname === "/" || pathname === "") {
    return NextResponse.rewrite(new URL("/admin", request.url));
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return NextResponse.next();
  return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
