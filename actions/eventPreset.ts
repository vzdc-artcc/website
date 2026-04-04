'use server';

import prisma from "@/lib/db";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@/generated/prisma/client";
import {after} from "next/server";
import {log} from "./log";
import {z} from "zod";
import {revalidatePath} from "next/cache";

export const fetchEventPresets = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {

    const orderBy: Prisma.EventPositionPresetOrderByWithRelationInput = {};

    if (sort.length > 0) {
        orderBy[sort[0].field as keyof Prisma.EventPositionPresetOrderByWithRelationInput] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.eventPositionPreset.count({
            where: getWhere(filter),
        }),
        prisma.eventPositionPreset.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.EventPositionPresetWhereInput => {

    if (!filter) {
        return {};
    }

    switch (filter.field) {
        case 'name':
            return {
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'positions':
            return {
                positions: {
                    hasSome: filter.value.split(','),
                },
            }
        default:
            return {};
    }
}

export const deleteEventPreset = async (id: string) => {
    const positionPreset = await prisma.eventPositionPreset.delete({
        where: {
            id,
        }
    });

    revalidatePath('/admin/event-presets');

    after(async () => {
        await log('DELETE', 'EVENT_POSITION_PRESET', `Deleted event position preset '${positionPreset.name}'`);
    });
}

export const createOrUpdateEventPreset = async (formData: FormData) => {

    const presetZ = z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Name must be at least 1 character long'),
        positions: z.array(z.string()),
    });

    const result = presetZ.safeParse({
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        positions: (formData.get('positions') as string).split(','),
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const positionPreset = await prisma.eventPositionPreset.upsert({
        where: {
            id: result.data.id,
        },
        update: {
            name: result.data.name,
            positions: {
                set: result.data.positions,
            },
        },
        create: {
            name: result.data.name,
            positions: {
                set: result.data.positions,
            },
        },
    });

    after(async () => {
        if (result.data.id) {
            await log('UPDATE', 'EVENT_POSITION_PRESET', `Updated event position preset '${positionPreset.name}'`);
        } else {
            await log('CREATE', 'EVENT_POSITION_PRESET', `Created event position preset '${positionPreset.name}'`);
        }
    });

    revalidatePath('/admin/event-presets');

    return {positionPreset};
}