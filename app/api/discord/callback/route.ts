import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Discord's OAuth app has this exact path registered as its redirect_uri.
// The actual token exchange now happens client-side against osmium
// (POST /me/discord/link/complete, which needs the browser's osmium
// session cookie) — this route just forwards the query string to a real
// page that can make that call.
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const dest = new URL("/profile/discord-callback", url.origin);
    url.searchParams.forEach((value, key) => dest.searchParams.set(key, value));
    return NextResponse.redirect(dest);
}
