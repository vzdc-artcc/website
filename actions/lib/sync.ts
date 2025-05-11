'use server';

import prisma from "@/lib/db";
import {Prisma} from "@prisma/client";
import SyncTimesUncheckedUpdateInput = Prisma.SyncTimesUncheckedUpdateInput;

export const updateSyncTime = async (data: SyncTimesUncheckedUpdateInput) => {

    const oldSync = await prisma.syncTimes.findFirst();

    if (oldSync) {
        await prisma.syncTimes.update({
            where: {id: oldSync.id},
            data,
        });
    } else {
        await prisma.syncTimes.create({
            data: {
                roster: data.roster as Date,
                stats: data.stats as Date,
                loas: data.loas as Date,
                events: data.events as Date,
                soloCert: data.soloCert as Date,
                appointments: data.appointments as Date,
            },
        });
    }

}