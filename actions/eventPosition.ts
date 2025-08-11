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

    const eventPositionZ = z.object({
        controllerId: z.string().min(1, { message: 'Controller is required' }),
        requestedPosition: z.string().min(1, { message: 'Requested Position is required' }).max(50, { message: 'Requested Position must be less than 50 characters' }),
        requestedStartTime: z.date().min(event.start, { message: 'Requested time must be within the event' }).max(event.end, { message: 'Requested time must be within the event' }),
        requestedEndTime: z.date().min(event.start, { message: 'Requested time must be within the event' }).max(event.end, { message: 'Requested time must be within the event' }),
        notes: z.string().optional(),
    });

    const result = eventPositionZ.safeParse({
        controllerId: admin ? formData.get('userId') : session.user.id,
        requestedPosition: formData.get('requestedPosition'),
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
    const eventPositionZ = z.object({
        finalPosition: z.string().min(1, { message: 'Final Position is required and could not be autofilled.' }).max(50, { message: 'Final Position must be less than 50 characters' }),
        finalStartTime: z.date().min(event.start, { message: 'Final time must be within the event' }).max(event.end, { message: 'Final time must be within the event' }),
        finalEndTime: z.date().min(event.start, { message: 'Final time must be within the event' }).max(event.end, { message: 'Final time must be within the event' }),
        finalNotes: z.string().optional(),
    });

    const requestedPosition = formData.get('requestedPosition') as string;
    let finalPosition = formData.get('finalPosition') as string;
    if (!finalPosition && event.presetPositions.includes(requestedPosition)) {
        finalPosition = requestedPosition;
    }

    const data =  eventPositionZ.safeParse({
        finalPosition,
        finalStartTime: new Date(formData.get('finalStartTime') as string),
        finalEndTime: new Date(formData.get('finalEndTime') as string),
        finalNotes: formData.get('finalNotes'),
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
        where: {
            id: position.id,
        },
        data: {
            finalPosition: result.data.finalPosition,
            finalStartTime: result.data.finalStartTime,
            finalEndTime: result.data.finalEndTime,
            finalNotes: result.data.finalNotes,
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
