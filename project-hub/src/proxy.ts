import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const pathname = request.nextUrl.pathname;
  if (hostname !== "project.nischay.tech" && hostname !== "localhost" && hostname !== "127.0.0.1") {
    return NextResponse.next();
  }
  if (pathname === "/login") return NextResponse.rewrite(new URL("/admin/login", request.url));
  if (pathname === "/dashboard") return NextResponse.rewrite(new URL("/admin", request.url));
  if (pathname === "/dashboard/projects" || pathname.startsWith("/dashboard/projects/")) {
    return NextResponse.rewrite(new URL(pathname.replace("/dashboard", "/admin"), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
