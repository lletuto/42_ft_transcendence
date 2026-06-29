import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(request: NextRequest) {

  const token = request.cookies.get("jwt");


  const protectedRoutes = [
    "/jeu",
    "/profile",
    "/chat"
  ];


  const path = request.nextUrl.pathname;


  const needsAuth = protectedRoutes.some(
    (route) => path.startsWith(route)
  );


  if (needsAuth && !token) {

      const refreshToken = request.cookies.get("refreshToken");
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // return NextResponse.redirect(
    //   new URL("/login", request.url)
    // );

  }

  const response = NextResponse.next();
  if(needsAuth)
  {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/jeu/:path*",
    "/profile/:path*",
    "/chat/:path*"
  ],
};