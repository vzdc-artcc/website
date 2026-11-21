'use server';

import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export const fetchOnboardingState = async (userId: string) => {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user || !session?.user || user.id !== session.user.id) {
        throw new Error('Permission/user error');
    }

    let onboarding = await prisma.onboarding.findUnique({
        where: {
            userId,
        }
    });

    if (!onboarding) {
        onboarding = await prisma.onboarding.create({
            data: {
                userId: userId,
                step: 0
            }
        });
    }

    return onboarding.step;
}

export const updateOnboardingStep = async (userId: string, step: number) => {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user || !session?.user || user.id !== session.user.id) {
        throw new Error('Permission/user error');
    }

    const o = await prisma.onboarding.update({
        where: {
            userId,
        },
        data: {
            step,
        }
    });

    if (!o) {
        throw new Error('Failed to update onboarding step');
    }

    return step;
}

export const completeOnboarding = async (userId: string) => {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user || !session?.user || user.id !== session.user.id) {
        throw new Error('Permission/user error');
    }

    const o = await prisma.onboarding.delete({
        where: {
            userId,
        },
    });

    if (!o) {
        throw new Error('Failed to complete onboarding');
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            showWelcomeMessage: false,
        }
    });

    return true;
}