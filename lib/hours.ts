import prisma from "@/lib/db";
import {ControllerLogMonth} from "@/generated/prisma/browser";
import {getMonth} from "@/lib/date";

export async function getMonthHours(month: number, year: number) {
    const monthLogs = await prisma.controllerLogMonth.findMany({
        where: {
            month,
            year
        },
    });

    return monthLogs.reduce((acc, log) => acc + log.deliveryHours + log.groundHours + log.towerHours + log.approachHours + log.centerHours, 0).toFixed(3);
}

export async function getAllTimeHours() {
    const allLogs = await prisma.controllerLogMonth.findMany();

    return allLogs.reduce((acc, log) => acc + log.deliveryHours + log.groundHours + log.towerHours + log.approachHours + log.centerHours, 0);
}

export const getMonthLog = (logs: ControllerLogMonth[] | any[]): {
    title: string,
    deliveryHours: number,
    groundHours: number,
    towerHours: number,
    approachHours: number,
    centerHours: number,
}[] => {
    return logs.reduce((acc, log) => {
        const month = log.month;

        if (!acc[month]) {
            acc[month] = {
                title: getMonth(month),
                deliveryHours: 0,
                groundHours: 0,
                towerHours: 0,
                approachHours: 0,
                centerHours: 0
            };
        }

        acc[month].deliveryHours += log.deliveryHours;
        acc[month].groundHours += log.groundHours;
        acc[month].towerHours += log.towerHours;
        acc[month].approachHours += log.approachHours;
        acc[month].centerHours += log.centerHours;

        return acc;
    }, [] as {
        title: string,
        deliveryHours: number,
        groundHours: number,
        towerHours: number,
        approachHours: number,
        centerHours: number
    }[]);
}

export const getTotalHours = (logs: ControllerLogMonth[] | any[]): {
    deliveryHours: number,
    groundHours: number,
    towerHours: number,
    approachHours: number,
    centerHours: number,
} => {
    return logs.reduce((acc, log) => {

        acc.deliveryHours += log.deliveryHours;
        acc.groundHours += log.groundHours;
        acc.towerHours += log.towerHours;
        acc.approachHours += log.approachHours;
        acc.centerHours += log.centerHours;

        return acc;
    }, {
        deliveryHours: 0,
        groundHours: 0,
        towerHours: 0,
        approachHours: 0,
        centerHours: 0
    });
}

export const getTop3Controllers = (logs: ControllerLogMonth[] | any[]): any[] => {
    return logs.reduce((acc, log) => {
        const user = log.log.user;

        if (!acc[parseInt(user.cid)]) {
            acc[parseInt(user.cid)] = {
                user: user,
                hours: 0
            };
        }

        acc[parseInt(user.cid)].hours += log.deliveryHours + log.groundHours + log.towerHours + log.approachHours + log.centerHours;

        return acc;
    }, [] as {
        user: any,
        hours: number,
    }[]).sort((a: any, b: any) => b.hours - a.hours).slice(0, 3);
}

export const getControllerLog = (logs: ControllerLogMonth[] | any[]): any[] => {
    return logs.reduce((acc, log) => {
        const user = log.log.user;

        if (!acc[parseInt(user.cid)]) {
            acc[parseInt(user.cid)] = {
                title: `${user.firstName} ${user.lastName} (${user.cid})`,
                deliveryHours: 0,
                groundHours: 0,
                towerHours: 0,
                approachHours: 0,
                centerHours: 0,
            };
        }

        acc[parseInt(user.cid)].deliveryHours += log.deliveryHours;
        acc[parseInt(user.cid)].groundHours += log.groundHours;
        acc[parseInt(user.cid)].towerHours += log.towerHours;
        acc[parseInt(user.cid)].approachHours += log.approachHours;
        acc[parseInt(user.cid)].centerHours += log.centerHours;

        return acc;
    }, [] as {
        title: string,
        deliveryHours: number,
        groundHours: number,
        towerHours: number,
        approachHours: number,
        centerHours: number,
    }[]);
}