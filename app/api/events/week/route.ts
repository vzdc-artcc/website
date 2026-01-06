import prisma from "@/lib/db";
import {verifyUpdaterKey} from "@/lib/update";
import {NextRequest} from "next/server";

const BOT_API_BASE_URL = process.env.BOT_API_BASE_URL || 'http://localhost:5500';
const BOT_API_SECRET_KEY = process.env.BOT_API_SECRET_KEY || '1234';
const {DISCORD_GUILD_ID} = process.env;

export async function GET(req: NextRequest) {

    if (!(await verifyUpdaterKey(req))) {
        return new Response('Unauthorized', {status: 401});
    }

    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    const events = await prisma.event.findMany({
        where: {
            start: {
                gte: now,
            },
            end: {
                lte: weekFromNow,
            },
            archived: null,
        },
        orderBy: {
            start: 'asc',
        },
    });

    const res = await fetch(`${BOT_API_BASE_URL}/weekly_event_reminder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': BOT_API_SECRET_KEY,
        },
        body: JSON.stringify({
            guild_id: DISCORD_GUILD_ID,
            events: events.map((e) => ({
                event_name: e.name,
                event_id: e.id,
                event_description: e.description,
                event_start_time: e.start,
                event_end_time: e.end,
                event_type: e.type,
                event_host: e.host,
                event_banner_url: e.bannerKey ? `https://utfs.io/f/${e.bannerKey}` : null,
                event_feature_fields: e.featuredFields,
            })),
        }),
    });

    return Response.json(res.ok);
}
