import {NextRequest} from "next/server";

const {TS_KEY, OSMIUM_SERVICE_TOKEN} = process.env;
// Server-side calls prefer an internal URL if set, else the public base.
const OSMIUM_API_URL = process.env.OSMIUM_INTERNAL_API_URL || process.env.NEXT_PUBLIC_OSMIUM_API_URL;

/**
 * TeamSpeak presence lookup. The TeamSpeak server posts a client UID (with the
 * shared TS_KEY) and gets back the linked controller's status/rating/online
 * position. The external contract is unchanged; the data now comes from osmium
 * (`POST /integrations/teamspeak/lookup`) instead of Prisma, called with a
 * service-account bearer token.
 */
export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const key = searchParams.get('key');
    if (!key || !TS_KEY || key !== TS_KEY) return Response.json({}, {
        status: 403,
    });

    const uid = (await request.text()).trim();

    if (!uid) return Response.json({}, {
        status: 400,
    });

    const res = await fetch(`${OSMIUM_API_URL}/api/v1/integrations/teamspeak/lookup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OSMIUM_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({uid}),
        cache: 'no-store',
    });

    if (!res.ok) return Response.json({}, {
        status: res.status,
    });

    const data: {
        cid: number,
        controller_status: string | null,
        rating: string | null,
        online_position: string | null,
    } = await res.json();

    return Response.json({
        controllerStatus: data.controller_status,
        rating: data.rating,
        onlinePosition: data.online_position,
        cid: data.cid,
    });
}
