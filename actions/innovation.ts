'use server';
import {OrderItem} from "@/components/Order/OrderList";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {InnovationLabProject} from "@/generated/prisma/client";
import {z} from "zod";
import {after} from "next/server";

export const updateInnovationLabProjectOrder = async (items: OrderItem[]) => {
    for (const item of items) {
        await prisma.innovationLabProject.update({
            data: {
                order: item.order,
            },
            where: {
                id: item.id,
            },
        });
    }

    await log('UPDATE', 'INNOVATION_LAB_PROJECT', 'Updated innovation project order');
    revalidatePath('/admin/innovation', 'layout');
    revalidatePath("/publications/innovation", 'layout');
}

export const createOrUpdateInnovationLabProject = async (data: Partial<InnovationLabProject>) => {
    const projectZ = z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Name is required"),
        alias: z.string().min(1, "Alias is required"),
        description: z.string().min(1, "Description is required")
    });

    const result = projectZ.safeParse(data);

    if (!result.success) {
        return {errors: result.error.issues};
    }

    if ((await prisma.innovationLabProject.count({
        where: {
            alias: result.data.alias,
            id: {not: result.data.id || ''}
        }
    })) > 0) {
        return {errors: [{message: "Alias must be unique"}]};
    }

    const project = await prisma.innovationLabProject.upsert({
        where: {id: result.data.id || ''},
        create: {
            name: result.data.name,
            alias: result.data.alias,
            description: result.data.description,
        },
        update: {
            name: result.data.name,
            alias: result.data.alias,
            description: result.data.description,
        },
    });

    revalidatePath('/admin/innovation', 'layout');
    revalidatePath("/publications/innovation", 'layout');

    after(() => {
        if (result.data.id) {
            log('UPDATE', 'INNOVATION_LAB_PROJECT', `Updated innovation project ${project.name}`);
        } else {
            log('CREATE', 'INNOVATION_LAB_PROJECT', `Created innovation project ${project.name}`);
        }
    });

    return {project};
}

export const deleteInnovationLabProject = async (id: string) => {
    const project = await prisma.innovationLabProject.delete({
        where: {id},
    });

    if (project) {
        await log('DELETE', 'INNOVATION_LAB_PROJECT', `Deleted innovation project ${project.name}`);
    }

    revalidatePath('/admin/innovation', 'layout');
    revalidatePath("/publications/innovation", 'layout');
}