'use server';

import {z} from "zod";
import {User} from "next-auth";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";

export const updateCurrentProfile = async (user: User) => {
    const User = z.object({
        preferredName: z.string().max(40, "Preferred name must not be over 40 characters").optional(),
        bio: z.string().max(400, "Bio must not be over 400 characters").optional(),
        operatingInitials: z.string().length(2, "Operating Initials must be 2 characters").toUpperCase(),
        receiveEmail: z.boolean(),
        newEventNotifications: z.boolean(),
        timezone: z.string().min(1, "Timezone is required"),
    });

    const result = User.parse(user);


    const operatingInitials = await prisma.user.findMany({
        where: {
            id: {
                not: user.id,
            },
            operatingInitials: result.operatingInitials,
        }
    });

    if (operatingInitials.length > 0) {
        return "Operating Initials already in use.";
    }

    await prisma.user.update({
        data: result,
        where: {
            id: user.id
        },
    });

    revalidatePath('/profile/overview');
    revalidatePath(`/admin/controller/${user.cid}`);
    revalidatePath('/controllers/roster', "layout");
}

export const updateTeamspeakUid = async (user: User, teamspeakUid: string) => {
    const TeamspeakUid = z.object({
        teamspeakUid: z.string().optional(),
    });

    const result = TeamspeakUid.parse({teamspeakUid});

    if (result.teamspeakUid === user.teamspeakUid) {
        return;
    }

    await prisma.user.update({
        data: {
            teamspeakUid: result.teamspeakUid,
        },
        where: {
            id: user.id
        },
    });

    revalidatePath('/profile/overview');
}