'use server';

import prisma from "@/lib/db";
import {log} from "./log";
import {after} from "next/server";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {EventType, Prisma} from "@prisma/client";
import {SafeParseReturnType, z} from "zod";
import {UTApi} from "uploadthing/server";
import {revalidatePath} from "next/cache";
import {sendEventPositionRemovalEmail} from "./mail/event";
import {User} from "next-auth";
import {ZodErrorSlimResponse} from "@/types";

const MAX_FILE_SIZE = 1024 * 1024 * 4;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ut = new UTApi();

export const fetchEvents = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem, archived?: boolean) => {

    const orderBy: Prisma.EventOrderByWithRelationInput = {};

    if (sort.length > 0) {
        orderBy[sort[0].field as keyof Prisma.EventOrderByWithRelationInput] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.event.count({
            where: getWhere(filter, archived),
        }),
        prisma.event.findMany({
            orderBy,
            where: getWhere(filter, archived),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
}

const getWhere = (filter?: GridFilterItem, archived?: boolean): Prisma.EventWhereInput => {
    const baseWhere: Prisma.EventWhereInput = {
        archived: archived ? { not: null } : null
    };

    if (!filter) {
        return baseWhere;
    }

    switch (filter.field) {
        case 'name':
            return {
                ...baseWhere,
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'type':
            return {
                ...baseWhere,
                type: {
                    equals: filter.value as EventType,
                },
            };
        case 'hidden':
            return {
                ...baseWhere,
                hidden: {
                    equals: filter.value as boolean,
                },
            };
        default:
            return baseWhere;
    }
}

export const validateEvent = async (input: { [key: string]: any }, zodResponse?: boolean): Promise<ZodErrorSlimResponse | SafeParseReturnType<any, any>> => {
    
    const isAfterToday = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };
    
    const isBeforeEndDate = (start: Date, end: Date) => {
        return start <= end;
    };
    
    const bannerImageOrUrlExists = (data: any) => {
        if (data.id) {
            return true; // Skip validation if editing
        }

        if (data.bannerImage && (data.bannerImage as File).size > 0 ) {
            const file = data.bannerImage as File;
            return ALLOWED_FILE_TYPES.includes(file?.type || '') && file.size <= MAX_FILE_SIZE;
        } else if (data.bannerUrl) {
            return z.string().url().safeParse(data.bannerUrl).success;
        }
    
        return (data.bannerImage && (data.bannerImage as File).size > 0) || data.bannerUrl;
    };
    
    const isLongerThan30Minutes = (start: Date, end: Date) => {
        const duration = (end.getTime() - start.getTime()) / (1000 * 60); // duration in minutes
        return duration > 30;
    };


    const eventZ = z.object({
        id: z.string().optional(),
        name: z.string().min(3, { message: "Name must be between 3 and 255 characters" }).max(255, { message: "Name must be between 3 and 255 characters" }),
        host: z.string().min(1, {message: "Host is required"}).max(100, {message: "Host must be less than 100 characters"}),
        start: z.date({ required_error: 'Start date is required' }).refine(isAfterToday, { message: "Start date must be after today" }),
        end: z.date({ required_error: 'End date is required' }),
        type: z.nativeEnum(EventType, { required_error: 'Type is required' }),
        description: z.string().min(10, { message: "Description must be at least 10 characters." }),
        bannerImage: z.any().optional(),
        bannerUrl: z.string().optional(),
        featuredFields: z.array(z.string()),
    }).refine(data => isLongerThan30Minutes(data.start, data.end), {
        message: "Event duration must be longer than 30 minutes.",
        path: ["end"],
    }).refine(data => isBeforeEndDate(data.start, data.end), {
        message: "Start date must be before the end date.",
        path: ["start"],
    }).refine(bannerImageOrUrlExists, {
        message: "Either banner image or a VALID banner URL must exist.",
        path: ["bannerImage", "bannerUrl"],
    })

    const data = eventZ.safeParse(input);

    if (zodResponse) {
        return data;
    }
    
    return {
        success: data.success,
        errors: data.error ? data.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
        })) : [],
    }
}

export const upsertEvent = async (formData: FormData) => {

    const result = await validateEvent({
        id: formData.get('id'),
        name: formData.get('name'),
        host: formData.get('host'),
        start: new Date(formData.get('start') as string),
        end: new Date(formData.get('end') as string),
        type: formData.get('type'),
        description: formData.get('description'),
        bannerImage: formData.get('bannerImage') as File,
        bannerUrl: (formData.get('bannerUrl') as string) || undefined,
        featuredFields: JSON.parse(formData.get('featuredFields') as string),
    }, true) as SafeParseReturnType<any, any>;

    if (!result.success) {
        return { errors: result.error.errors };
    }

    const { data } = result;
    const existingEvent = await prisma.event.findUnique({
        where: {
            id: data.id,
        },
    });

    let bannerKey = existingEvent?.bannerKey;

    if ((data.bannerImage as File)?.size > 0 || data.bannerUrl) {
        if ((data.bannerImage as File)?.size > 0) {
            const res = await ut.uploadFiles(data.bannerImage as File);

            if (!res.data) {
                return { errors: [{message: 'Failed to upload banner image.'}] };
            }

            bannerKey = res.data?.key;
        } else if (data.bannerUrl) {
            const res = await ut.uploadFilesFromUrl(data.bannerUrl);

            if (!res.data) {
                return { errors: [{message: 'Failed to upload banner image from URL.'}] };
            }

            bannerKey = res.data?.key;
        }

        if (existingEvent?.bannerKey) {
            const res = await ut.deleteFiles(existingEvent.bannerKey);

            if (!res.success) {
                return { errors: [{message: 'Failed to delete old banner image.'}] };
            }
        }
    }

    const event = await prisma.event.upsert({
        where: {
            id: data.id,
        },
        update: {
            name: data.name,
            start: data.start,
            end: data.end,
            host: data.host,
            type: data.type,
            description: data.description,
            featuredFields: data.featuredFields,
            bannerKey,
        },
        create: {
            name: data.name,
            start: data.start,
            end: data.end,
            host: data.host,
            type: data.type,
            description: data.description,
            featuredFields: data.featuredFields,
            bannerKey,
        },
    });

    if (data.id) {
        revalidatePath(`/events/admin/events/${data.id}`);
    }

    after(async () => {
        if (data.id) {
            await log("UPDATE", "EVENT", `Updated event ${data.name}.`);
        } else {
            await log("CREATE", "EVENT", `Created event ${data.name}.`);
        }
    });

    return {event};
}

export const deleteEvent = async (id: string) => {

    const event = await prisma.event.delete({
        where: {
            id,
        },
        include: {
            positions: {
                include: {
                    user: true,
                },
            },
        },
    });

    after(async () => {
        await log("DELETE", "EVENT", `Deleted event ${event.name}.`);

        for (const position of event.positions) {
            sendEventPositionRemovalEmail(position.user as User, position, event);
        }
    });

    revalidatePath('/events/admin/events');
}

export const updateEventPresetPositions = async (eventId: string, positions: string[]) => {
    const event = await prisma.event.update({
        where: {
            id: eventId,
        },
        data: {
            presetPositions: {
                set: positions,
            },
        },
    });

    revalidatePath(`/events/admin/events/${eventId}/manager`);

    after(async () => {
        await log("UPDATE", "EVENT", `Updated '${event.name}' preset positions.`);
    });
}