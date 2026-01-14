import prisma from "@/lib/db";
import { randomBytes } from "crypto";

const DISCORD_AUTHORIZE = "https://discord.com/oauth2/authorize";
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";
const DISCORD_API_ME = "https://discord.com/api/users/@me";

export async function createDiscordAuthUrl(userId: string) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    if (!clientId || !redirectUri) {
        throw new Error("missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI");
    }

    const state = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.discordOauthState.create({ data: { state, userId, expiresAt } });

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "identify",
        state,
    });

    return `${DISCORD_AUTHORIZE}?${params.toString()}`;
}

async function exchangeCodeForToken(code: string) {
    const body = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI || "",
    });

    const r = await fetch(DISCORD_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!r.ok) throw new Error("token exchange failed");
    return r.json();
}

async function fetchDiscordUser(accessToken: string) {
    const r = await fetch(DISCORD_API_ME, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) throw new Error("failed fetching discord user");
    return r.json();
}

export async function handleDiscordCallback({
                                                code,
                                                state,
                                                currentUserId,
                                            }: {
    code: string;
    state: string;
    currentUserId?: string;
}) {
    const saved = await prisma.discordOauthState.findUnique({ where: { state } });
    if (!saved) throw new Error("invalid_state");
    if (saved.expiresAt.getTime() < Date.now()) {
        await prisma.discordOauthState.delete({ where: { state } }).catch((err) => {
            console.error("Failed to delete expired Discord OAuth state:", err);
        });
        throw new Error("state_expired");
    }
    if (currentUserId && saved.userId !== currentUserId) throw new Error("state_user_mismatch");

    const tokenResp = await exchangeCodeForToken(code); // your existing helper
    const accessToken = tokenResp.access_token;
    if (!accessToken) throw new Error("no_access_token");

    const discordUser = await fetchDiscordUser(accessToken);
    const discordId: string = discordUser.id;
    const username: string = discordUser.username ?? "";
    const discriminator: string | undefined = discordUser.discriminator;
    const tag = discriminator ? `${username}#${discriminator}` : username;

    await prisma.user.update({
        where: { id: saved.userId },
        data: {
            discordUid: discordId,
            discordTag: tag,
            discordConnectedAt: new Date(),
        },
    });

    await prisma.discordOauthState.delete({ where: { state } });

    return { discordId, tag, userId: saved.userId };
}

export async function unlinkDiscord(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            discordUid: null,
            discordTag: null,
            discordConnectedAt: null,
        },
    });
}