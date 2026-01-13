import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { handleDiscordCallback } from "@/actions/discordLink";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const baseRedirect = (params: Record<string, string>) => {
        const dest = new URL("/profile/overview", req.url);
        Object.entries(params).forEach(([k, v]) => dest.searchParams.set(k, v));
        return NextResponse.redirect(dest);
    };

    if (!code || !state) return baseRedirect({ discord_error: "missing_params" });

    const saved = await prisma.discordOauthState.findUnique({ where: { state } });
    if (!saved) return baseRedirect({ discord_error: "invalid_state" });
    if (saved.expiresAt.getTime() < Date.now()) {
        await prisma.discordOauthState.delete({ where: { state } }).catch(() => {});
        return baseRedirect({ discord_error: "state_expired" });
    }

    try {
        const result = await handleDiscordCallback({ code, state });
        const tag = result?.tag ?? "";
        return baseRedirect({ discord_linked: "1", discord_username: tag });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return baseRedirect({ discord_error: msg });
    }
}