import React from 'react';
import prisma from "@/lib/db";
import {Alert} from "@mui/material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function StaffTasksAlert() {

    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.staffPositions.some(pos => ['ATM', 'DATM', 'TA', 'WM'].includes(pos)
    )) {
        return <></>;
    }

    const pendingVisitorApplications = await prisma.visitorApplication.count({
        where: {
            status: "PENDING",
        },
    });

    const pendingFeedback = await prisma.feedback.count({
        where: {
            status: "PENDING",
        },
    });

    const activeIncidentReports = await prisma.incidentReport.count({
        where: {
            closed: false,
        },
    });

    const pendingLoas = await prisma.lOA.count({
        where: {
            status: "PENDING",
        },
    });

    const pendingTasks = pendingVisitorApplications + pendingFeedback + activeIncidentReports + pendingLoas;

    return pendingTasks > 0 && (
        <Alert severity="warning" sx={{my: 1,}}>
            There {pendingTasks == 1 ? 'is' : 'are'} currently <b>{pendingTasks} pending senior staff
            task{pendingTasks == 1 ? '' : 's'}</b> under Facility Administration.
        </Alert>
    );
}