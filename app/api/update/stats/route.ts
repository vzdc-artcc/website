import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {User} from "next-auth";
import {ControllerLogMonth} from "@prisma/client";
import {updateSyncTime} from "@/actions/lib/sync";
import {verifyUpdaterOrigin} from "@/lib/update";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {

    if (!(await verifyUpdaterOrigin(req))) {
        return new Response('Unauthorized', {status: 401});
    }

    const now = new Date();
    const syncTime = await prisma.syncTimes.findFirst();

    if (syncTime?.stats && syncTime.stats?.getTime() > now.getTime() - 1000 * 10) {
        return Response.json({ ok: false, });
    }

    const allControllers = await prisma.user.findMany({
        select: {
            id: true,
            cid: true,
            log: {
                include: {
                    months: true,
                },
            },
        },
    });

    const vatsimData = await fetchVatsimControllerData();

    const prefixes = await prisma.statisticsPrefixes.findFirst();

    for (const controller of allControllers) {
        const vatsimUser = vatsimData.find((user) => user.cid + '' === controller.cid);

        const activePosition = await prisma.controllerPosition.findFirst({
            where: {
                logId: controller.log?.id,
                active: true,
            },
        });

        if (!vatsimUser || !prefixes?.prefixes.some((prefix) => vatsimUser.callsign.startsWith(prefix + "_"))) {
            // The controller is offline
            if (activePosition) {
                // The controller was active on a position, mark it as inactive
                await prisma.controllerPosition.updateMany({
                    where: {
                        log: {
                            userId: controller.id,
                        },
                        active: true,
                    },
                    data: {
                        active: false,
                        end: now,
                    },
                });

                await addHours(controller as unknown as User, getFacilityType(activePosition.facility || 0), getHoursControlledSinceLastUpdate(now, activePosition.start), controller.log?.months.find((month) => month.month === now.getMonth() && month.year === now.getFullYear()));
            }
            continue;
        }

        if (activePosition && vatsimUser.callsign !== activePosition.position) {
            // The controller is no longer active on this position
            await prisma.controllerPosition.update({
                where: {
                    id: activePosition.id,
                },
                data: {
                    active: false,
                    end: now,
                },
            });
            await addHours(controller as unknown as User, getFacilityType(activePosition.facility || 0), getHoursControlledSinceLastUpdate(now, activePosition.start), controller.log?.months.find((month) => month.month === now.getMonth() && month.year === now.getFullYear()));
            await prisma.controllerPosition.create({
                data: {
                    log: {
                        connectOrCreate: {
                            create: {
                                userId: controller.id,
                            },
                            where: {
                                userId: controller.id,
                            },
                        },
                    },
                    position: vatsimUser.callsign,
                    start: vatsimUser.logon_time,
                    facility: vatsimUser.facility,
                    active: true,
                },
            });
        } else if (!activePosition) {
            await prisma.controllerPosition.create({
                data: {
                    log: {
                        connectOrCreate: {
                            create: {
                                userId: controller.id,
                            },
                            where: {
                                userId: controller.id,
                            },
                        },
                    },
                    position: vatsimUser.callsign,
                    start: vatsimUser.logon_time,
                    facility: vatsimUser.facility,
                    active: true,
                },
            });
        }

        await prisma.lOA.deleteMany({
            where: {
                userId: controller.id,
                start: {
                    lte: now,
                },
                end: {
                    gte: now,
                },
                status: 'APPROVED',
            },
        });
    }

    await updateSyncTime({stats: new Date(),});

    revalidatePath('/', 'layout');

    return Response.json({ok: true,});
}

const fetchVatsimControllerData = async () => {
    const res = await fetch('https://data.vatsim.net/v3/vatsim-data.json', {
        cache: "no-store",
    });
    const data: {
        cid: number,
        callsign: string,
        facility: number,
        frequency: string,
        last_updated: string,
        logon_time: string,
    }[] = (await res.json()).controllers;
    return data.filter((controller) => !controller.frequency.startsWith('199'));
}

const getHoursControlledSinceLastUpdate = (now: Date, then: Date) => {
    return (now.getTime() - then.getTime()) / 1000 / 60 / 60;
}

const addHours = async (controller: User, facility: string, hours: number, prevLogMonth?: ControllerLogMonth,) => {

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    await prisma.controllerLogMonth.upsert({
        create: {
            month,
            year,
            deliveryHours: facility === 'DEL' ? hours : 0,
            groundHours: facility === 'GND' ? hours : 0,
            towerHours: facility === 'TWR' ? hours : 0,
            approachHours: facility === 'APP' ? hours : 0,
            centerHours: facility === 'CTR' ? hours : 0,
            log: {
                connectOrCreate: {
                    create: {
                        userId: controller.id,
                    },
                    where: {
                        userId: controller.id,
                    },
                },
            },
        },
        update: {
            deliveryHours: (prevLogMonth?.deliveryHours || 0) + (facility === 'DEL' ? hours : 0),
            groundHours: (prevLogMonth?.groundHours || 0) + (facility === 'GND' ? hours : 0),
            towerHours: (prevLogMonth?.towerHours || 0) + (facility === 'TWR' ? hours : 0),
            approachHours: (prevLogMonth?.approachHours || 0) + (facility === 'APP' ? hours : 0),
            centerHours: (prevLogMonth?.centerHours || 0) + (facility === 'CTR' ? hours : 0),
        },
        where: {
            logId_month_year: {
                logId: prevLogMonth?.logId || '',
                month,
                year,
            },
        },
    });
}

const getFacilityType = (facility: number) => {
    switch (facility) {
        case 0:
            return 'OBS';
        case 1:
            return 'FSS';
        case 2:
            return 'DEL';
        case 3:
            return 'GND';
        case 4:
            return 'TWR';
        case 5:
            return 'APP';
        case 6:
            return 'CTR';
        default:
            return 'UNK';
    }
}