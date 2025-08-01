'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {sendMissionCreatedEmail} from "@/actions/mail/sua";

export const createSuaRequest = async (formData: FormData) => {

    const session = await getServerSession(authOptions);

    if (!session) return {};

    const existingMissions = await prisma.suaBlock.count({
        where: {
            userId: session.user.id,
            start: {
                gte: new Date(),
            },
        },
    });

    if (existingMissions >= 2) {
        return {errors: [{message: "You can only have 2 active SUA requests at a time."}]};
    }

    const staffingRequestZ = z.object({
        userId: z.string(),
        afiliation: z.string().min(1, 'Name must be at least 1 character long'),
        start: z.date({required_error: "You must select a start date."}),
        end: z.date({required_error: "You must select an end date."}),
        details: z.string().min(1, 'Description must be at least 1 character long'),
    });

    const result = staffingRequestZ.safeParse({
        userId: formData.get('userId'),
        afiliation: formData.get('afiliation') as string,
        start: formData.get('start') ? new Date(formData.get('start') as string) : undefined,
        end: formData.get('end') ? new Date(formData.get('end') as string) : undefined,
        details: formData.get('details') as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    if (result.data.start.getTime() >= result.data.end.getTime()) {
        return {errors: [{message: "Start date must be before end date."}]};
    }

    if (result.data.start.getTime() < Date.now()) {
        return {errors: [{message: "Start date must be in the future."}]};
    }

    if (result.data.end.getTime() - result.data.start.getTime() < 30 * 60 * 1000) {
        return {errors: [{message: "Duration of the SUA request must be greater than 30 minutes."}]};
    }

    if (result.data.end.getTime() - result.data.start.getTime() > 12 * 60 * 60 * 1000) {
        return {errors: [{message: "Duration of the SUA request must not exceed 12 hours."}]};
    }

    let requestedAirspace: {
        [key: string]: {
            top?: string;
            bottom?: string;
        }
    } = {};

    for (const [key, value] of formData.entries()) {
        if (key.startsWith('airspace.')) {
            const airspaceDetails = key.replace('airspace.', '').split('.');
            const existing = requestedAirspace[airspaceDetails[0]] || {};
            if (!Number.isInteger(Number(value))) {
                return {errors: [{message: `Invalid value for airspace ${airspaceDetails[0]}`}]};
            } else if (value && `${value}`.length != 3) {
                return {errors: [{message: `Airspace ${airspaceDetails[0]} must be a 3-digit altitude in FL.`}]};
            }

            if (airspaceDetails[1] === 'top') {
                existing.top = value as string;
            } else if (airspaceDetails[1] === 'bottom') {
                existing.bottom = value as string;
            }
            requestedAirspace[airspaceDetails[0]] = existing;
        }
    }

    requestedAirspace = Object.fromEntries(
        Object.entries(requestedAirspace).filter(([_, value]) => value.top && value.bottom)
    );

    const isStartWithin24Hours = (result.data.start.getTime() - Date.now()) <= 24 * 60 * 60 * 1000;

    const missionNumber = isStartWithin24Hours
        ? `${Math.floor(Math.random() * 900) + 100}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
        : `${Math.floor(Math.random() * 9000) + 1000}`;

    const mission = await prisma.suaBlock.create({
        data: {
            user: {
                connect: {
                    id: session.user.id,
                }
            },
            afiliation: result.data.afiliation,
            start: result.data.start,
            end: result.data.end,
            details: result.data.details,
            missionNumber,
            airspace: {
                createMany: {
                    data: Object.entries(requestedAirspace).map(([key, value]) => ({
                        identifier: key,
                        bottomAltitude: value.bottom as string,
                        topAltitude: value.top as string,
                    })),
                },
            },
        },
        include: {
            airspace: true,
        }
    });

    sendMissionCreatedEmail(session.user, mission).then();

    return {mission};
}

export const deleteSuaRequest = async (missionId: string) => {
    const session = await getServerSession(authOptions);

    if (!session) return {};

    const mission = await prisma.suaBlock.findUnique({
        where: {
            id: missionId,
        },
        include: {
            airspace: true,
        }
    });

    if (!mission || mission.userId !== session.user.id) {
        return {errors: [{message: "Mission not found or you do not have permission to delete it."}]};
    }

    await prisma.suaBlock.delete({
        where: {
            id: missionId,
        }
    });
}