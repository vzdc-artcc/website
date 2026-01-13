import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { createDiscordAuthUrl } from "@/actions/discordLink";
import type { NextRequest } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
        }

        const url = await createDiscordAuthUrl(session.user.id);

        return NextResponse.redirect(url);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}