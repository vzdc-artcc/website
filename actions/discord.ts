'use server';
import {Event, PrismaClient} from '@prisma/client';
import {getServerSession} from 'next-auth';
import {authOptions} from "@/auth/auth";
import {log} from "@/actions/log";
import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";


const prisma = new PrismaClient();

const BOT_API_BASE_URL = process.env.BOT_API_BASE_URL || 'http://localhost:5500';
const BOT_API_SECRET_KEY = process.env.BOT_API_SECRET_KEY || '1234';
const {DISCORD_GUILD_ID} = process.env;

interface SendAnnouncementResult {
    ok?: boolean;
    errors?: { message: string }[];
    status?: number;
}

export async function sendAnnouncement(
    messageType: string,
    title: string,
    body: string,
): Promise<SendAnnouncementResult> {
    const session = await getServerSession(authOptions);

    let authorName: string | undefined;
    let authorRating: number | undefined;
    let authorStaffPosition: string | undefined;

    if (!session?.user?.id) {
        console.error('Announcement Error: User not authenticated or user ID missing from session.');
        return {
            ok: false,
            errors: [{ message: 'You must be logged in to send an announcement.' }],
            status: 401,
        };
    }

    const authorId = session.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: authorId },
            select: {
                firstName: true,
                lastName: true,
                rating: true,
                staffPositions: true,
            },
        });

        if (user) {
            authorName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined;
            authorRating = user.rating;
            authorStaffPosition = user.staffPositions.length > 0
                ? user.staffPositions.map(pos => pos.toString()).join(', ')
                : undefined;
        } else {
            console.warn(`User with ID ${authorId} from session not found in the database. Announcement will proceed without author details.`);
        }
    } catch (dbError) {
        console.error(`Error fetching user ${authorId} from database:`, dbError);
        return {
            ok: false,
            errors: [{ message: `Failed to retrieve author details: ${dbError instanceof Error ? dbError.message : String(dbError)}` }],
            status: 500,
        };
    } finally {
        await prisma.$disconnect();
    }

    const payload = {
        message_type: messageType,
        title: title,
        body: body,
        author: authorName,
        author_rating: authorRating,
        author_staff_position: authorStaffPosition,
        guild_id: DISCORD_GUILD_ID,
    };

    try {
        const response = await fetch(`${BOT_API_BASE_URL}/announcement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': BOT_API_SECRET_KEY,
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error(`Bot API Error (${response.status}):`, responseData);
            return {
                ok: false,
                errors: [{ message: responseData.message || 'Unknown error from bot API' }],
                status: response.status,
            };
        }

        console.log('Bot API Success:', responseData);
        // revalidatePath('/admin/announcements');
        await log("CREATE", "DISCORD_MESSAGE", `Sent a ${messageType}`);
        return { ok: true, status: response.status };

    } catch (error) {
        console.error('Error sending announcement to bot API:', error);
        return {
            ok: false,
            errors: [{ message: `Network or server error: ${error instanceof Error ? error.message : String(error)}` }],
        };
    }
}

export const sendDiscordEventPositionData = async (event: Event, positions: EventPositionWithSolo[], ping: boolean) => {

    const publishedPositions = positions.filter((position) => position.published);

    const res = await fetch(`${BOT_API_BASE_URL}/event_position_posting`, {
        method: 'POST',
        headers: {
            'X-API-Key': BOT_API_SECRET_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            guild_id: DISCORD_GUILD_ID,
            event_name: event.name,
            event_id: event.id,
            event_description: event.description,
            event_banner_url: `https://utfs.io/f/${event.bannerKey}`,
            event_start_time: event.start,
            event_end_time: event.end,
            controllers: publishedPositions.map((position) => ({
                controller_name: position.user?.fullName,
                controller_discord_id: position.user?.discordUid,
                controller_rating: position.user?.rating,
                controller_final_position: position.finalPosition,
                controller_final_start_time: position.finalStartTime,
                controller_final_end_time: position.finalEndTime
            })),
            ping_users: ping
        }),
    });

    if (!res.ok) {
        return res.status;
    }

    await log("CREATE", "DISCORD_MESSAGE", `Sent Discord event position data for event ${event.name}`);
}

export const sendEventPromotionalMessage = async (title: string, body: string, bannerKey: string) => {

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error();
    }

    try {
        const res = await fetch(`${BOT_API_BASE_URL}/announcements`, {
            method: 'POST',
            headers: {
                'X-API-Key': BOT_API_SECRET_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message_type: 'event-announcement',
                author_name: session.user.fullName,
                title,
                body,
                banner_url: `https://utfs.io/f/${bannerKey}`,
                guild_id: DISCORD_GUILD_ID
            }),
        });

        if (!res.ok) {
            return res.status;
        }
    } catch (e) {
        console.log(e);
        return;
    }


    await log("CREATE", "DISCORD_MESSAGE", `Sent event promotional message titled "${title}"`);
    return true;
}


