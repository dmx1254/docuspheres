import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;

    if (token && req.nextUrl.pathname === "/") {
      // If the user is authenticated and tries to access the sign-in page, redirect to a protected page
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
      signOut: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/"], // Add the root path to the matcher
};
