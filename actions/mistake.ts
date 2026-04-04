'use server';

import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@/generated/prisma/client";

export const deleteMistake = async (id: string) => {
    const mistake = await prisma.commonMistake.delete({
        where: {
            id,
        },
    });

    await log("DELETE", "COMMON_MISTAKE", `Deleted mistake ${mistake.name} - ${mistake.facility || 'N/A'}`);
    revalidatePath('/training/mistakes');
}

export const createOrUpdateMistake = async (formData: FormData) => {
    const mistakeZ = z.object({
        name: z.string().min(1, "Name is required"),
        facility: z.string().optional(),
        description: z.string().min(1, "Description is required"),
        mistakeId: z.string().optional(),
    });

    const result = mistakeZ.safeParse({
        name: formData.get('name'),
        facility: formData.get('facility'),
        description: formData.get('description'),
        mistakeId: formData.get('mistakeId'),
    });

    if (!result.success) {
        return JSON.parse(JSON.stringify(result.error.errors));
    }

    if (result.data.mistakeId) {
        const mistake = await prisma.commonMistake.update({
            where: {
                id: result.data.mistakeId,
            },
            data: {
                name: result.data.name,
                facility: result.data.facility,
                description: result.data.description,
            },
        });

        await log("UPDATE", "COMMON_MISTAKE", `Updated mistake ${mistake.name} - ${mistake.facility || 'N/A'}`);
        revalidatePath(`/training/mistakes/${mistake.id}`);
    
    } else {
        const mistake = await prisma.commonMistake.create({
            data: {
                name: result.data.name,
                facility: result.data.facility,
                description: result.data.description,
            },
        });

        await log("CREATE", "COMMON_MISTAKE", `Created mistake ${mistake.name} - ${mistake.facility || 'N/A'}`);
    }

    revalidatePath('/training/mistakes');
    return false
}

export const fetchCommonMistakes = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.CommonMistakeOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.CommonMistakeOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.commonMistake.count({
            where: getWhere(filter),
        }),
        prisma.commonMistake.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
};

const getWhere = (filter?: GridFilterItem): Prisma.CommonMistakeWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'name':
            return {
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'facility':
            return {
                description: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        default:
            return {};
    }
};