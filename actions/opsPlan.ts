'use server';

import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { after } from "next/server";
import { log } from "./log";
import { Event } from "@prisma/client";

export const saveOpsPlan = async (event: Event, formData: FormData, admin?: boolean) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { errors: [{ message: 'You must be logged in to perform this action' }] };
    }

    const allowed = session.user.roles.includes('STAFF') || session.user.roles.includes('EVENT_STAFF') || admin;
    if (!allowed) {
        return { errors: [{ message: 'You do not have permission to perform this action' }] };
    }

    const raw = (formData.get('featuredFieldConfigs') as string) || '{}';
    let parsed: Record<string, any> = {};
    try {
        parsed = raw ? JSON.parse(raw) : {};
        parsed = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k.toUpperCase(), v]));
    } catch (err) {
        return { errors: [{ message: 'Invalid featured field configuration format (must be valid JSON).' }] };
    }

    try {
        const updated = await prisma.event.update({
            where: { id: event.id },
            data: {
                featuredFieldConfigs: parsed,
            },
        });

        after(async () => {
            await log("UPDATE", "EVENT", `Updated OPS plan for event ${event.name}.`);
        });

        try {
            const { revalidatePath } = await import("next/cache");
            revalidatePath(`/events/admin/events/${event.id}/manager`);
        } catch (e) {
        }

        return { event: updated };
    } catch (err) {
        console.error("saveOpsPlan error:", err);
        return { errors: [{ message: 'Failed to save OPS Plan.' }] };
    }
}

export const fetchFullEvent = async (eventId: string) => {
    if (!eventId) return null;

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
            id: true,
            name: true,
            host: true,
            start: true,
            end: true,
            type: true,
            hidden: true,
            archived: true,
            positionsLocked: true,
            manualPositionsOpen: true,
            featuredFields: true,
            featuredFieldConfigs: true,
            opsFreeText: true,
            opsPlanPublished: true,

            positions: {
                orderBy: { requestedStartTime: 'asc' },
                select: {
                    id: true,
                    eventId: true,
                    userId: true,
                    requestedPosition: true,
                    requestedSecondaryPosition: true,
                    notes: true,
                    requestedStartTime: true,
                    requestedEndTime: true,
                    finalStartTime: true,
                    finalEndTime: true,
                    finalPosition: true,
                    finalNotes: true,
                    published: true,
                    submittedAt: true,
                    controllingCategory: true,
                    isInstructor: true,
                    isSolo: true,
                    isOts: true,
                    isTmu: true,
                    isCic: true,

                    user: {
                        select: {
                            id: true,
                            cid: true,
                            operatingInitials: true,
                            firstName: true,
                            lastName: true,
                            fullName: true,
                            email: true,
                            controllerStatus: true,
                            rating: true,
                            timezone: true,
                            certifications: {
                                select: {
                                    id: true,
                                    certificationOption: true,
                                    certificationTypeId: true,
                                    certificationType: { select: { id: true, name: true } },
                                },
                            },
                            soloCertifications: {
                                select: {
                                    id: true,
                                    position: true,
                                    expires: true,
                                    certificationTypeId: true,
                                    certificationType: { select: { id: true, name: true } },
                                },
                            },
                        },
                    },
                },
            },

            eventTmis: {
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    category: true,
                    text: true,
                    createdBy: true,
                    createdAt: true,
                },
            },

            presetPositions: true,
            tmis: true,
        },
    });

    return event;
};

