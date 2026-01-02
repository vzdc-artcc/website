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

    const pendingAdminTasks = pendingVisitorApplications + pendingFeedback + activeIncidentReports + pendingLoas;

    const trainingReleaseRequests = await prisma.trainerReleaseRequest.count();

    const pendingOtsRecs = await prisma.otsRecommendation.count({
        where: {
            assignedInstructorId: null,
        },
    });

    const pendingTrainingTasks = trainingReleaseRequests + pendingOtsRecs;

    return (
        <>
            {pendingAdminTasks > 0 &&
                <Alert severity="warning" sx={{my: 1,}}>
                    There {pendingAdminTasks == 1 ? 'is' : 'are'} currently <b>{pendingAdminTasks} pending senior staff
                    task{pendingAdminTasks == 1 ? '' : 's'}</b> under Facility Administration.
                </Alert>}
            {pendingTrainingTasks > 0 &&
                <Alert severity="warning" sx={{my: 1,}}>
                    There {pendingTrainingTasks == 1 ? 'is' : 'are'} currently <b>{pendingTrainingTasks} pending TA
                    task{pendingTrainingTasks == 1 ? '' : 's'}</b> under Training Administration.
                </Alert>}
        </>
    );
}