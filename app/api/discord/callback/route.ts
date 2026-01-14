// app/api/discord/callback/route.ts (excerpt)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { handleDiscordCallback } from "@/actions/discordLink";

function getBaseOrigin(req: NextRequest) {
    // Prefer explicit env var in production
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    // Fallback via forwarded headers (Cloudflare/nginx)
    const proto = req.headers.get("x-forwarded-proto") || req.headers.get("x-forwarded-protocol") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "vzdc.org";
    return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const makeRedirect = (params: Record<string, string>) => {
        const base = getBaseOrigin(req);
        const dest = new URL("/profile/overview", base);
        Object.entries(params).forEach(([k, v]) => dest.searchParams.set(k, v));
        return NextResponse.redirect(dest);
    };

    try {
        if (!code || !state) return makeRedirect({ discord_error: "missing_params" });

        const saved = await prisma.discordOauthState.findUnique({ where: { state } });
        if (!saved) return makeRedirect({ discord_error: "invalid_state" });
        if (saved.expiresAt.getTime() < Date.now()) {
            await prisma.discordOauthState.delete({ where: { state } }).catch(() => {});
            return makeRedirect({ discord_error: "state_expired" });
        }

        const result = await handleDiscordCallback({ code, state });
        const tag = result?.tag ?? "";
        return makeRedirect({ discord_linked: "1", discord_username: tag });
    } catch (err: unknown) {
        console.error("Discord callback error:", err);
        return makeRedirect({ discord_error: "internal_error" });
    }
}