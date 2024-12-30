'use server';

import prisma from "@/lib/db";
import { after } from "next/server";
import { log } from "./log";
import { Event } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const toggleEventHidden = async (event: Event) => {
    
    await prisma.event.update({
        where: {
            id: event.id,
        },
        data: {
            hidden: !event.hidden,
            positionsLocked: true,
            manualPositionsOpen: false,
        }
    });

    revalidatePath(`/admin/events/${event.id}/manager`);

    after(async () => {
        await log("UPDATE", "EVENT", `${event.hidden ? 'Showed' : 'Hidden'} event ${event.name}.`);
    });
}

export const toggleEventArchived = async (event: Event) => {
        
        await prisma.event.update({
            where: {
                id: event.id,
            },
            data: {
                archived: event.archived ? null : new Date(),
                hidden: true,
                positionsLocked: true,
                manualPositionsOpen: false,
            },
        });
    
        revalidatePath(`/admin/events/${event.id}/manager`);
    
        after(async () => {
            await log("UPDATE", "EVENT", `${event.archived ? 'Unarchived' : 'Archived'} event ${event.name}.`);
        });
    }