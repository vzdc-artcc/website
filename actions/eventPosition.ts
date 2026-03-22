'use server';

import {authOptions} from "@/auth/auth";
import prisma from "@/lib/db";
import {Event, EventPosition} from "@prisma/client";
import {getServerSession, User} from "next-auth";
import {after} from "next/server";
import {SafeParseReturnType, z} from "zod";
import {log} from "./log";
import {revalidatePath} from "next/cache";
import {
    sendEventPositionEmail,
    sendEventPositionRemovalEmail,
    sendEventPositionRequestDeletedEmail
} from "./mail/event";
import {ZodErrorSlimResponse} from "@/types";
import dayjs from "dayjs";

export const toggleManualPositionOpen = async (event: Event) => {

    await prisma.event.update({
        where: { id: event.id },
        data: {
            manualPositionsOpen: !event.manualPositionsOpen,
        },
    });

    after(async () => {
        await log("UPDATE", "EVENT", `Toggled manual position open for event ${event.name}`);
    });

    revalidatePath(`/admin/events/${event.id}/manager`);
}

export const togglePositionsLocked = async (event: Event) => {

    await prisma.event.update({
        where: { id: event.id },
        data: {
            positionsLocked: !event.positionsLocked,
        },
    });

    after(async () => {
        await log("UPDATE", "EVENT", `Toggled positions locked for event ${event.name}`);
    });

    revalidatePath(`/admin/events/${event.id}/manager`);
}

export const saveEventPosition = async (event: Event, formData: FormData, admin?: boolean) => {

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return { errors: [{ message: 'You must be logged in to perform this action' }] };
    }

    if (!session.user.roles.includes('STAFF') && !session.user.roles.includes("EVENT_STAFF") && admin) {
        return { errors: [{ message: 'You do not have permission to perform this action' }] };
    }

    if (!admin && (await prisma.event.findUnique({ where: { id: event.id } }))?.positionsLocked) {
        return { errors: [{ message: 'Positions are locked for this event' }] };
    }

    if ((await prisma.eventPosition.count({ where: { eventId: event.id, userId: admin ? formData.get('userId') as string : session.user.id } })) > 0) {
        return { errors: [{ message: admin ? 'This controller already has a position request' : 'You have already requested a position for this event' }] };
    }

    const minStart = event.enableBufferTimes ? dayjs.utc(event.start).subtract(2, 'hour').toDate() : event.start;
    const maxEnd = event.enableBufferTimes ? dayjs.utc(event.end).add(2, 'hour').toDate() : event.end;

    const secondaryPositionRequest = ["Delivery", "Ground", "Tower", "Approach", "Center"]

    const eventPositionZ = z.object({
        controllerId: z.string().min(1, { message: 'Controller is required' }),
        requestedPosition: z.string().min(1, { message: 'Requested Position is required' }).max(50, { message: 'Requested Position must be less than 50 characters' }),
        requestedSecondaryPosition: z.string().refine((val) => {
            return secondaryPositionRequest.includes(val);
        }, {message: 'Requested Secondary Position must be one of the preset positions'}),
        requestedStartTime: z.date().min(minStart, {message: 'Requested time must be within the event'}).max(maxEnd, {message: 'Requested time must be within the event'}),
        requestedEndTime: z.date().min(minStart, {message: 'Requested time must be within the event'}).max(maxEnd, {message: 'Requested time must be within the event'}),
        notes: z.string().optional(),
    });

    const result = eventPositionZ.safeParse({
        controllerId: admin ? formData.get('userId') : session.user.id,
        requestedPosition: formData.get('requestedPosition'),
        requestedSecondaryPosition: formData.get('requestedSecondaryPosition'),
        requestedStartTime: new Date(formData.get('requestedStartTime') as string),
        requestedEndTime: new Date(formData.get('requestedEndTime') as string),
        notes: formData.get('notes'),
    });

    if (!result.success) {
        return { errors: result.error.errors };
    }

    const eventPosition = await prisma.eventPosition.create({
        data: {
            eventId: event.id,
            userId: result.data.controllerId,
            requestedPosition: result.data.requestedPosition,
            requestedSecondaryPosition: result.data.requestedSecondaryPosition,
            requestedStartTime: result.data.requestedStartTime,
            requestedEndTime: result.data.requestedEndTime,
            notes: `${result.data.notes}${admin ? `\n(MAN ASSIGN)` : ''}`,
        },
        include: {
            user: true,
        },
    });

    if (admin) {
        await prisma.eventPosition.update({
            where: {
                id: eventPosition.id,
            },
            data: {
                finalPosition: result.data.requestedPosition,
                finalStartTime: result.data.requestedStartTime,
                finalEndTime: result.data.requestedEndTime,
                finalNotes: result.data.notes,
            },
            include: {
                user: true,
            },
        });
    }
    
    after(async () => {
        if (admin && eventPosition) {
            await log("CREATE", "EVENT_POSITION", `Created event position for ${eventPosition.user?.firstName} ${eventPosition.user?.lastName} for ${eventPosition.requestedPosition} from ${eventPosition.requestedStartTime.toUTCString()} to ${eventPosition.requestedEndTime.toUTCString()}`);
        }
    });

    revalidatePath(`/events/${event.id}`);
    
    return { eventPosition };
}

export const deleteEventPosition = async (event: Event, eventPositionId: string, admin?: boolean) => {
    
        const session = await getServerSession(authOptions);
    
        if (!session?.user) {
            return { errors: [{ message: 'You must be logged in to perform this action' }] };
        }
    
        const eventPosition = await prisma.eventPosition.findUnique({
            where: {
                id: eventPositionId,
            },
            include: {
                user: true,
            },
        });
    
        if (!eventPosition) {
            return { errors: [{ message: 'Event position not found' }] };
        }
    
        if (!session.user.roles.includes('STAFF') && eventPosition.userId !== session.user.id) {
            return { errors: [{ message: 'You do not have permission to perform this action' }] };
        }
    
        const deletedPosition = await prisma.eventPosition.delete({
            where: {
                id: eventPositionId,
            },
        });
    
        after(async () => {
            if (deletedPosition && admin) {
                await log("DELETE", "EVENT_POSITION", `Deleted event position for ${eventPosition.user?.firstName} ${eventPosition.user?.lastName}`);
            }

            if (deletedPosition.published) {
                sendEventPositionRemovalEmail(eventPosition.user as User, eventPosition, event);
            } else if (admin) {
                sendEventPositionRequestDeletedEmail(eventPosition.user as User, event);
            }
        });
    
        revalidatePath(`/events/${event.id}`);
    
}

export const validateFinalEventPosition = async (event: Event, formData: FormData, zodResponse?: boolean): Promise<ZodErrorSlimResponse | SafeParseReturnType<any, any>> => {

    const minStart = event.enableBufferTimes ? dayjs.utc(event.start).subtract(2, 'hour').toDate() : event.start;
    const maxEnd = event.enableBufferTimes ? dayjs.utc(event.end).add(2, 'hour').toDate() : event.end;

    const eventPositionZ = z.object({
        finalPosition: z.string().min(1, { message: 'Final Position is required and could not be autofilled.' }).max(50, { message: 'Final Position must be less than 50 characters' }),
        finalStartTime: z.date().min(minStart, {message: 'Final time must be within the event'}).max(maxEnd, {message: 'Final time must be within the event'}),
        finalEndTime: z.date().min(minStart, {message: 'Final time must be within the event'}).max(maxEnd, {message: 'Final time must be within the event'}),
        finalNotes: z.string().optional(),
        
        controllingCategory: z.enum(['ADMIN','ENROUTE','TERMINAL','LOCAL']).optional(),
        isInstructor: z.preprocess((v) => {
            if (typeof v === 'string') return v === 'true';
            return v;
        }, z.boolean().optional()),
        isSolo: z.preprocess((v) => {
            if (typeof v === 'string') return v === 'true';
            return v;
        }, z.boolean().optional()),
        isOts: z.preprocess((v) => {
            if (typeof v === 'string') return v === 'true';
            return v;
        }, z.boolean().optional()),
        isTmu: z.preprocess((v) => {
            if (typeof v === 'string') return v === 'true';
            return v;
        }, z.boolean().optional()),
        isCic: z.preprocess((v) => {
            if (typeof v === 'string') return v === 'true';
            return v;
        }, z.boolean().optional()),
    });


    const requestedPosition = formData.get('requestedPosition') as string;
    let finalPosition = formData.get('finalPosition') as string;
    if (!finalPosition && event.presetPositions.includes(requestedPosition)) {
        finalPosition = requestedPosition;
    }

    const data = eventPositionZ.safeParse({
        finalPosition,
        finalStartTime: new Date(formData.get('finalStartTime') as string),
        finalEndTime: new Date(formData.get('finalEndTime') as string),
        finalNotes: formData.get('finalNotes'),
        controllingCategory: formData.get('controllingCategory') as string | null,
        isInstructor: formData.get('isInstructor'),
        isSolo: formData.get('isSolo'),
        isOts: formData.get('isOts'),
        isTmu: formData.get('isTmu'),
        isCic: formData.get('isCic'),
    });


    if (zodResponse) {
        return data;
    }

    return {
        success: data.success,
        errors: data.error ? data.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
        })) : [],
    };
}

export const adminSaveEventPosition = async (event: Event, position: EventPosition, formData: FormData) => {
    
    const result = await validateFinalEventPosition(event, formData, true) as SafeParseReturnType<any, any>;

    if (!result.success) {
        return { errors: result.error.errors };
    }

    const eventPosition = await prisma.eventPosition.update({
        where: { id: position.id },
        data: {
            finalPosition: result.data.finalPosition,
            finalStartTime: result.data.finalStartTime,
            finalEndTime: result.data.finalEndTime,
            finalNotes: result.data.finalNotes,
            controllingCategory: result.data.controllingCategory ?? undefined,
            isInstructor: result.data.isInstructor ?? false,
            isSolo: result.data.isSolo ?? false,
            isOts: result.data.isOts ?? false,
            isTmu: result.data.isTmu ?? false,
            isCic: result.data.isCic ?? false,
        },
        include: {
            user: true,
        },
    });


    after(async () => {
        if (eventPosition) {
            await log("UPDATE", "EVENT_POSITION", `Updated event position for ${eventPosition.user?.firstName} ${eventPosition.user?.lastName} to ${eventPosition.finalPosition} from ${eventPosition.finalStartTime?.toUTCString()} to ${eventPosition.finalEndTime?.toUTCString()}`);
        }

        if (eventPosition.published) {
            sendEventPositionEmail(eventPosition.user as User, eventPosition, event);
        }
    });

    revalidatePath(`/admin/events/${event.id}/manager`);

    return { eventPosition };
}

export const publishEventPosition = async (event: Event, position: EventPosition) => {

    const formData = new FormData();
    let finalPosition = position.finalPosition || '';

    if (!finalPosition && event.presetPositions.includes(position.requestedPosition)) {
        finalPosition = position.requestedPosition;
    }

    formData.set('finalPosition', finalPosition);
    formData.set('finalStartTime', position.finalStartTime?.toISOString() || position.requestedStartTime?.toISOString() || '');
    formData.set('finalEndTime', position.finalEndTime?.toISOString() || position.requestedEndTime?.toISOString() || '');
    formData.set('finalNotes', position.finalNotes || '');
    formData.set('controllingCategory', position.controllingCategory || 'LOCAL');
    formData.set('isInstructor', String(Boolean(position.isInstructor)));
    formData.set('isSolo', String(Boolean(position.isSolo)));
    formData.set('isOts', String(Boolean(position.isOts)));
    formData.set('isTmu', String(Boolean(position.isTmu)));
    formData.set('isCic', String(Boolean(position.isCic)));

    const result = await validateFinalEventPosition(event, formData, true) as SafeParseReturnType<any, any>;

    if (!result.success) {
        return { error: {
            success: false,
            errors: result.error.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        } as ZodErrorSlimResponse };
    }

    const eventPosition = await prisma.eventPosition.update({
        where: {
            id: position.id,
        },
        data: {
            finalPosition,
            published: true,
        },
        include: {
            user: true,
        },
    });

    after(async () => {
        if (eventPosition && eventPosition.user) {
            await log("UPDATE", "EVENT_POSITION", `Published event position for ${eventPosition.user?.firstName} ${eventPosition.user?.lastName} for ${eventPosition.finalPosition} from ${eventPosition.finalStartTime?.toUTCString()} to ${eventPosition.finalEndTime?.toUTCString()}`);
        }

        sendEventPositionEmail(eventPosition.user as User, eventPosition, event);
    });

    revalidatePath(`/admin/events/${event.id}/manager`);

    return { eventPosition };
}

export const unpublishEventPosition = async (event: Event, position: EventPosition) => {
    const eventPosition = await prisma.eventPosition.update({
        where: {
            id: position.id,
        },
        data: {
            published: false,
        },
        include: {
            user: true,
        },
    });

    after(async () => {
        if (eventPosition) {
            await log("UPDATE", "EVENT_POSITION", `Unpublished event position for ${eventPosition.user?.firstName} ${eventPosition.user?.lastName} for ${eventPosition.finalPosition} from ${eventPosition.finalStartTime?.toUTCString()} to ${eventPosition.finalEndTime?.toUTCString()}`);
        
            sendEventPositionRemovalEmail(eventPosition.user as User, eventPosition, event);
        }
    });

    revalidatePath(`/admin/events/${event.id}/manager`);

    return { eventPosition };
}

export const fetchAllUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            cid: true,
            firstName: true,
            lastName: true,
            rating: true,
        },
        where: {
            controllerStatus: {
                not: 'NONE',
            },
        },
    });
}

export const fetchCertificationsForUsers = async (userIds: string[]): Promise<Record<string, any[]>> => {
    if (!userIds || userIds.length === 0) {
        return {};
    }

    const certs = await prisma.certification.findMany({
        where: {
            userId: { in: userIds },
        },
        include: {
            certificationType: true,
        },
        orderBy: { certificationTypeId: 'asc' },
    });

    // group by userId
    const map: Record<string, any[]> = {};
    for (const c of certs) {
        if (!map[c.userId]) map[c.userId] = [];
        map[c.userId].push(c);
    }
    return map;
};

export const fetchLastControlledEventForUser = async (userId: string) => {
    if (!userId) return null;

    const pos = await prisma.eventPosition.findFirst({
        where: {
            userId,
            published: true,
            event: { archived: { not: null } },
        },
        include: {
            event: true,
        },
        orderBy: [
            { event: { start: 'desc' } },
        ],
    });

    if (!pos || !(pos as any).event) return null;

    const evt = (pos as any).event;
    return {
        id: evt.id,
        name: evt.name,
        date: evt.start ?? null,
        assignedPosition: pos.finalPosition ?? pos.requestedPosition ?? null,
        eventPositionId: pos.id,
    };
};


export const fetchLastControlledEventsForUsers = async (userIds: string[]) : Promise<Record<string, {
    id: string;
    name: string;
    date: Date | null;
    assignedPosition: string | null;
    eventPositionId: string;
}>> => {
    if (!userIds || userIds.length === 0) return {};

    const positions = await prisma.eventPosition.findMany({
        where: {
            userId: { in: userIds },
            published: true,
            event: { archived: { not: null } },
        },
        include: {
            event: true,
        },
        orderBy: [{ event: { start: 'desc' } }],
    });

    const map: Record<string, any> = {};
    for (const p of positions as any[]) {
        if (!p.userId || !p.event) continue;
        if (!map[p.userId]) {
            map[p.userId] = {
                id: p.event.id,
                name: p.event.name,
                date: p.event.start ?? null,
                assignedPosition: p.finalPosition ?? p.requestedPosition ?? null,
                eventPositionId: p.id,
            };
        }
    }

    return map;
};

export const saveOpsPlanFreeText = async (event: Event, formData: FormData, admin?: boolean) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { errors: [{ message: "You must be logged in to perform this action" }] };
    }

    const allowed = session.user.roles.includes("STAFF") || session.user.roles.includes("EVENT_STAFF") || !!admin;
    if (!allowed) {
        return { errors: [{ message: "You do not have permission to perform this action" }] };
    }

    if (!admin && (await prisma.event.findUnique({ where: { id: event.id } }))?.positionsLocked) {
        return { errors: [{ message: "Positions are locked for this event" }] };
    }

    const opsFreeText = String(formData.get("opsFreeText") || "");

    try {
        const updated = await prisma.event.update({
            where: { id: event.id },
            data: {
                opsFreeText: opsFreeText || null,
            },
        });

        after(async () => {
            await log("UPDATE", "EVENT", `Updated OPS free text for event ${event.name}`);
        });

        try {
            const { revalidatePath } = await import("next/cache");
            revalidatePath(`/events/admin/events/${event.id}/manager`);
        } catch (e) {
        }

        return { event: updated };
    } catch (err) {
        console.error("saveOpsPlanFreeText error:", err);
        return { errors: [{ message: "Failed to save OPS free text." }] };
    }
};


export async function setOpsPlanPublished(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { errors: [{ message: "You must be logged in to perform this action" }] };
    }

    const allowed = session.user.roles.includes("STAFF") || session.user.roles.includes("EVENT_STAFF");
    if (!allowed) {
        return { errors: [{ message: "You do not have permission to perform this action" }] };
    }

    const eventId = String(formData.get('eventId'));
    const publish = String(formData.get('publish')) === 'true';

    try {
        const updated = await prisma.event.update({
            where: { id: eventId },
            data: { opsPlanPublished: publish },
        });

        after(async () => {
            await log(
                "UPDATE",
                "EVENT",
                `Set OPS plan published=${publish} for event ${eventId}`
            );
        });

        try {
            revalidatePath(`/events/admin/events/${eventId}/manager`);
        } catch (e) {
            // Ignore revalidation errors
        }

        return updated;
    } catch (err) {
        console.error("setOpsPlanPublished error:", err);
        return { errors: [{ message: "Failed to update OPS plan published status." }] };
    }
}
