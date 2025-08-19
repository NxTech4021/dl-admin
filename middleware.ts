import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    // This is a lightweight check that doesn't hit the database.
    const sessionCookie = getSessionCookie(request);

    // Protected routes - add any routes you want to protect
    const protectedPaths = ['/dashboard', '/admin'];
    const isProtectedRoute = protectedPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );

    // Allow access to auth routes (login, register, etc.)
    const authPaths = ['/login', '/register', '/api/auth'];
    const isAuthRoute = authPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );

    // If accessing a protected route without a session
    if (isProtectedRoute && !sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If accessing auth routes while already logged in, redirect to home
    if (isAuthRoute && sessionCookie && !request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Apply middleware to all routes except static files and api routes (except auth)
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
