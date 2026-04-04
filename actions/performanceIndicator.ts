'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {after} from "next/server";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@/generated/prisma/client";

export const getLessonPerformanceIndicator = async (lessonId: string) => {
    return prisma.lessonPerformanceIndicator.findUnique({
        where: {lessonId},
    });
}

export const fetchAllPerformanceIndicators = async () => {
    return prisma.performanceIndicatorTemplate.findMany({
        orderBy: {name: "asc"},
    });
}

export const fetchPerformanceIndicators = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.PerformanceIndicatorTemplateOrderByWithRelationInput = sort[0]?.field ? {[sort[0].field]: sort[0].sort} : {name: "asc"};

    return prisma.$transaction([
        prisma.performanceIndicatorTemplate.count({
            where: getWhere(filter),
        }),
        prisma.performanceIndicatorTemplate.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        }),
    ]);
}

const getWhere = (filter?: GridFilterItem) => {
    if (!filter) {
        return {};
    }

    switch (filter.field) {
        case "name":
            return {name: {contains: filter.value}};
        default:
            return {};
    }
}

export const createOrUpdatePerformanceIndicator = async (formData: FormData) => {
    const piZ = z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Name is required"),
    });

    const result = piZ.safeParse({
        id: formData.get("id") as string,
        name: formData.get("name") as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const pi = await prisma.performanceIndicatorTemplate.upsert({
        where: {id: result.data.id},
        update: {name: result.data.name},
        create: {name: result.data.name},
    });

    after(async () => {
        if (result.data.id) {
            await log("UPDATE", "PERFORMANCE_INDICATOR_TEMPLATE", `Updated performance indicator ${pi.name}`);
        } else {
            await log("CREATE", "PERFORMANCE_INDICATOR_TEMPLATE", `Created performance indicator ${pi.name}`);
        }
    });

    revalidatePath("/training/indicators");

    return {performanceIndicator: pi};
}

export const deletePerformanceIndicator = async (id: string) => {
    const pi = await prisma.performanceIndicatorTemplate.delete({where: {id}});

    after(async () => {
        await log("DELETE", "PERFORMANCE_INDICATOR_TEMPLATE", `Deleted performance indicator ${pi.name}`);
    });

    revalidatePath("/training/indicators");

    return {performanceIndicator: pi};
}