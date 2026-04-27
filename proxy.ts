import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((request) => {
  if (!request.auth && request.nextUrl.pathname.startsWith("/dashboard")) {
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", "/dashboard/stats");

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};