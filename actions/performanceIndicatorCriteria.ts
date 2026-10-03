'use server';

import {OrderItem} from "@/components/Order/OrderList";
import prisma from "@/lib/db";
import {after} from "next/server";
import {log} from "@/actions/log";
import {z} from "zod";
import {revalidatePath} from "next/cache";

export const createOrUpdateCriteria = async (formData: FormData) => {
    const criteriaZ = z.object({
        id: z.string().optional(),
        categoryId: z.string(),
        name: z.string().min(1, "Name must be at least 1 character"),
    });

    const result = criteriaZ.safeParse({
        id: formData.get("id") as string,
        categoryId: formData.get("categoryId") as string,
        name: formData.get("name") as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const criteria = await prisma.performanceIndicatorCriteria.upsert({
        where: {
            id: result.data.id,
        },
        create: {
            name: result.data.name,
            categoryId: result.data.categoryId,
        },
        update: {
            name: result.data.name,
        },
        include: {
            category: true,
        },
    });

    revalidatePath(`/training/indicators/${criteria.category.templateId}`);

    after(async () => {
        if (result.data.id) {
            await log("UPDATE", "PERFORMANCE_INDICATOR_CRITERIA", `Updated criteria ${criteria.name} in category ${criteria.category.name}`);
        } else {
            await log("CREATE", "PERFORMANCE_INDICATOR_CRITERIA", `Created criteria ${criteria.name} in category ${criteria.category.name}`);
        }
    });

    return {criteria};
}

export const updateCriteriaOrder = async (order: OrderItem[]) => {

    let templateId = "";

    for (const item of order) {
        const criteria = await prisma.performanceIndicatorCriteria.update({
            where: {id: item.id},
            data: {
                order: item.order,
            },
            include: {
                category: true,
            },
        });

        templateId = criteria.category.templateId;
    }

    revalidatePath(`/training/indicators/${templateId}`);

    after(async () => {
        await log("UPDATE", "PERFORMANCE_INDICATOR_CRITERIA", `Updated criteria order`);
    });
}

export const deletePerformanceIndicatorCriteria = async (id: string) => {

    const criteria = await prisma.performanceIndicatorCriteria.delete({
        where: {
            id,
        },
        include: {
            category: true,
        },
    });

    revalidatePath(`/training/indicators/${criteria.category.templateId}`);

    after(async () => {
        await log("DELETE", "PERFORMANCE_INDICATOR_CRITERIA", `Deleted criteria ${criteria.name} in category ${criteria.category.name}`);
    });

    return {criteria};
}

export const getCriteria = async (performanceIndicatorId: string) => {
    return prisma.performanceIndicatorCriteria.findMany({
        where: {
            category: {
                templateId: performanceIndicatorId,
            },
        },
        orderBy: {
            category: {
                order: 'asc',
            },
        },
        include: {
            category: true,
        },
    });
}