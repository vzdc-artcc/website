'use server';

import {LogModel, LogType} from "@/generated/prisma/client";
import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {DEV_CIDS, isDebugCid} from "@/lib/key";

export const log = async (type: LogType, model: LogModel, message: string) => {

    const session = await getServerSession(authOptions);

    if (session && !isDebugCid(DEV_CIDS, session.user.cid)) {
        await prisma.log.create({
            data: {
                user: {
                    connect: {
                        id: session.user.id,
                    }
                },
                timestamp: new Date(),
                type,
                model,
                message,
            }
        })
    }
}
