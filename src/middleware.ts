import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

// Lightweight middleware that does NOT import auth.ts (which pulls in prisma)
// JWT session check is done by decrypting the session cookie using @auth/core/jwt
// Full auth checks are done in API routes via `auth()` from @/lib/auth

async function getSessionFromCookie(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionCookie) return null;

  const salt =
    sessionCookie.name === "__Secure-authjs.session-token"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  try {
    const payload = await decode({
      token: sessionCookie.value,
      secret: process.env.NEXTAUTH_SECRET || "",
      salt,
    });
    return payload as {
      id?: string;
      role?: string;
      email?: string;
      isAdmin?: boolean;
    } | null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromCookie(request);

  const isLoggedIn = !!session;

  // Admin pages require admin role
  if (pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    if (!session.isAdmin) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
  }

  // Write operations require authentication
  if (
    (pathname === "/api/submit" || pathname === "/api/run") &&
    request.method === "POST"
  ) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
  }

  // Profile requires authentication
  if (pathname === "/profile" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
