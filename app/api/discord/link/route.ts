// app/api/discord/link/route.ts (debug)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { createDiscordAuthUrl } from "@/actions/discordLink";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    console.log("DEBUG /api/discord/link invoked");
    try {
        const session = await getServerSession(authOptions);
        console.log("DEBUG session:", !!session, session?.user?.id);
        if (!session?.user?.id) {
            console.error("DEBUG: no session");
            return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
        }

        const url = await createDiscordAuthUrl(session.user.id);
        console.log("DEBUG createDiscordAuthUrl returned:", url);

        // Return URL as JSON for debugging
        return NextResponse.redirect(url);
    } catch (err: unknown) {
        console.error("DEBUG /api/discord/link error:", err);
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}