import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // Defer auth gating to Better Auth hooks/components.
    // We no longer rely on a custom JWT cookie in middleware.
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Apply middleware to all routes except static files and api routes (except auth)
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
