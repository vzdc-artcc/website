import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";

const BOT_API_SECRET_KEY = process.env.BOT_API_SECRET_KEY ?? "1234";

export async function GET(req: NextRequest) {
    try {
        const apiKey =
            req.headers.get("API-Key") ?? req.headers.get("api-key") ?? null;

        const session = await getServerSession(authOptions);

        const positions = Array.isArray(session?.user?.staffPositions)
            ? session.user.staffPositions
            : [];

        const isWm =
            positions.includes("WM") || positions.includes("AWM");

        if (!(isWm || apiKey === BOT_API_SECRET_KEY)) {
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