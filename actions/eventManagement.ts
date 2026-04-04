'use server';

import prisma from "@/lib/db";
import {after} from "next/server";
import {log} from "./log";
import {User as NAUser} from "next-auth";
import {Event} from "@/generated/prisma/client";
import {revalidatePath} from "next/cache";
import {sendEventPositionEmail, sendEventPositionRemovalEmail, sendEventPostedEmail} from "./mail/event";
import {UTApi} from "uploadthing/server";

const ut = new UTApi();

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

        if (event.hidden) {
            const users = await prisma.user.findMany({
                where: {
                    newEventNotifications: true,
                    controllerStatus: {
                        not: 'NONE',
                    },
                },
            });

            for (const user of users) {
                sendEventPostedEmail(user as NAUser, event);
            }
        }
    });
}

export const toggleEventArchived = async (event: Event) => {
        
        const updatedEvent = await prisma.event.update({
            where: {
                id: event.id,
            },
            data: {
                archived: event.archived ? null : new Date(),
                hidden: true,
                positionsLocked: true,
                manualPositionsOpen: false,
                bannerKey: event.archived ? event.bannerKey : null,
            },
            include: {
                positions: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    
        revalidatePath(`/admin/events/${event.id}/manager`);
        revalidatePath(`/admin/events/${event.id}`);
    
        after(async () => {
            await log("UPDATE", "EVENT", `${event.archived ? 'Unarchived' : 'Archived'} event ${event.name}.`);

            if (updatedEvent.archived) {
                await ut.deleteFiles(event.bannerKey || '');
            }

            if (updatedEvent.start.getTime() < new Date().getTime()) {
                for (const position of updatedEvent.positions.filter(p => p.published)) {
                    if (updatedEvent.archived) {
                        sendEventPositionRemovalEmail(position.user as NAUser, position, updatedEvent);
                    } else {
                        sendEventPositionEmail(position.user as NAUser, position, updatedEvent);
                    }
                }   
            }
        });
    }