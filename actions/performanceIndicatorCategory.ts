'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {after} from "next/server";
import {log} from "@/actions/log";
import {OrderItem} from "@/components/Order/OrderList";

export const createOrUpdatePerformanceIndicatorCategory = async (formData: FormData) => {
    const picZ = z.object({
        templateId: z.string(),
        id: z.string().optional(),
        name: z.string().min(1, "Name is required"),
    });

    const result = picZ.safeParse({
        templateId: formData.get('templateId') as string,
        id: formData.get('id') as string,
        name: formData.get('name') as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const pic = await prisma.performanceIndicatorCriteriaCategory.upsert({
        where: {
            id: result.data.id,
        },
        update: {
            name: result.data.name,
        },
        create: {
            name: result.data.name,
            template: {
                connect: {
                    id: result.data.templateId,
                },
            },
        },
        include: {
            template: true,
        }
    });

    revalidatePath(`/training/indicators/${pic.template.id}`);

    after(async () => {
        if (result.data.id) {
            await log('UPDATE', 'PERFORMANCE_INDICATOR_CRITERIA_CATEGORY', `Updated category ${pic.name} in template ${pic.template.name}`);
        } else {
            await log('CREATE', 'PERFORMANCE_INDICATOR_CRITERIA_CATEGORY', `Created category ${pic.name} in template ${pic.template.name}`);
        }
    });

    return {pic};
}

export const deletePerformanceIndicatorCategory = async (id: string) => {

    const category = await prisma.performanceIndicatorCriteriaCategory.delete({
        where: {
            id,
        },
        include: {
            template: true,
        }
    });

    revalidatePath(`/training/indicators/${category.template.id}`);

    after(async () => {
        await log('DELETE', 'PERFORMANCE_INDICATOR_CRITERIA_CATEGORY', `Deleted category ${category.name} in template ${category.template.name}`);
    });
}

export const updateCategoryOrder = async (order: OrderItem[]) => {
    for (const item of order) {
        await prisma.performanceIndicatorCriteriaCategory.update({
            where: {
                id: item.id,
            },
            data: {
                order: item.order,
            }
        });
    }

    revalidatePath('/training/indicators');

    after(async () => {
        await log('UPDATE', 'PERFORMANCE_INDICATOR_CRITERIA_CATEGORY', `Updated category order`);
    });
}