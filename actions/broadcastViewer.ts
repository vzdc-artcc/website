'use server';

import prisma from "@/lib/db";
import {User} from "next-auth";
import {revalidatePath} from "next/cache";

export const handleSeenBroadcast = async (user: User, broadcastId: string) => {
    await prisma.changeBroadcast.update({
        where: {
            id: broadcastId,
        },
        data: {
            unseenBy: {
                disconnect: {
                    id: user.id,
                },
            },
            seenBy: {
                connect: {
                    id: user.id,
                },
            }
        },
    });

    revalidatePath('/', "layout");
}

export const handleAgreeBroadcast = async (user: User, broadcastId: string) => {
    await prisma.changeBroadcast.update({
        where: {
            id: broadcastId,
        },
        data: {
            unseenBy: {
                disconnect: {
                    id: user.id,
                },
            },
            seenBy: {
                disconnect: {
                    id: user.id,
                },
            },
            agreedBy: {
                connect: {
                    id: user.id,
                },
            }
        },
        include: {
            unseenBy: true,
            seenBy: true,
        },
    });

    revalidatePath('/', "layout");
}