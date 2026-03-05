import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";

const BOT_API_SECRET_KEY = process.env.BOT_API_SECRET_KEY;

export async function GET(req: NextRequest) {
    if (!BOT_API_SECRET_KEY) {
        throw new Error("BOT_API_SECRET_KEY environment variable is not set");\
    }

    try {
        const apiKey =
            req.headers.get("x-api-key") ??
            req.headers.get("X-API-Key") ??
            req.headers.get("API-Key") ??
            req.headers.get("api-key") ??
            null;

        const hasValidApiKey = apiKey === BOT_API_SECRET_KEY;

        let isWm = false;

        if (!hasValidApiKey) {
            const session = await getServerSession(authOptions);

            const positions = Array.isArray(session?.user?.staffPositions)
                ? session.user.staffPositions
                : [];

            isWm = positions.includes("WM") || positions.includes("AWM");
        }

        if (!(isWm || hasValidApiKey)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const configs = await prisma.discordConfig.findMany({
            include: {
                channels: true,
                roles: true,
                categories: true,
            },
        });

        return NextResponse.json(configs);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
