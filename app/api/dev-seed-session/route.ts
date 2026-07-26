import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import {Role, StaffPosition} from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({error: 'not available in production'}, {status: 404});
    }

    const {searchParams} = new URL(req.url);
    const cid = searchParams.get('cid');
    const roles = (searchParams.get('roles') || 'STAFF').split(',') as Role[];
    const staffPositions = (searchParams.get('staffPositions') || '').split(',').filter(Boolean) as StaffPosition[];
    const redirectTo = searchParams.get('redirect') || '/';

    if (!cid) {
        return NextResponse.json({error: 'cid required'}, {status: 400});
    }

    const user = await prisma.user.upsert({
        where: {cid},
        create: {
            cid,
            firstName: 'Dev',
            lastName: `CID${cid}`,
            fullName: `Dev CID${cid}`,
            artcc: 'ZDC',
            rating: 5,
            division: 'USA',
            roles,
            staffPositions,
            controllerStatus: 'HOME',
            updatedAt: new Date(),
        },
        update: {
            roles,
            staffPositions,
        },
    });

    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await prisma.session.create({
        data: {
            sessionToken,
            userId: user.id,
            expires,
        },
    });

    const response = NextResponse.redirect(new URL(redirectTo, req.url));
    response.cookies.set('next-auth.session-token', sessionToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        expires,
    });
    return response;
}
