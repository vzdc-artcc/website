import {NextRequest} from "next/server";
import prisma from "@/lib/db";

const {TS_KEY} = process.env;

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const key = searchParams.get('key');
    if (!key || !TS_KEY || key !== TS_KEY) return Response.json({}, {
        status: 403,
    });

    const uid = await request.text();

    if (!uid) return Response.json({}, {
        status: 400,
    });

    const user = await prisma.user.findFirst({
        where: {
            teamspeakUid: uid,
        },
        select: {
            id: true,
            controllerStatus: true,
            rating: true,
            cid: true,
        },
    });

    if (!user) return Response.json({}, {
        status: 404,
    });

    const activePosition = await prisma.controllerPosition.findFirst({
        where: {
            log: {
                userId: user.id,
            },
            active: true,
        }
    });

    const posName = activePosition?.position;

    return Response.json({
        controllerStatus: user.controllerStatus,
        rating: user.rating,
        onlinePosition: posName,
        cid: user.cid
    });
}