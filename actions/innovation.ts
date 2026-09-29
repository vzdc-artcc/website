'use server';
import {OrderItem} from "@/components/Order/OrderList";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";

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
}