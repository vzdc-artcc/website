'use server';

import prisma from "@/lib/db";
import {log} from "@/actions/log";

export const updateWelcomeMessages = async (home: string, visitor: string) => {
    await prisma.welcomeMessages.deleteMany();
    await prisma.welcomeMessages.create({
        data: {
            homeText: home,
            visitorText: visitor
        }
    });

    await log('UPDATE', 'WELCOME_MESSAGES', 'Updated welcome messages');
}

export const acknowledgeWelcomeMessage = async (userId: string) => {
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            showWelcomeMessage: false
        }
    });

}