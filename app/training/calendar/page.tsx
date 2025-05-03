import React from 'react';
import {Card, CardContent} from "@mui/material";
import TrainingAppointmentCalendar, {
    TrainingAppointmentWithAll
} from "@/components/TrainingAppointment/TrainingAppointmentCalendar";
import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {StaffPosition} from "@prisma/client";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const appointments = await prisma.trainingAppointment.findMany({
        include: {
            student: true,
            trainer: true,
            lessons: true,
        },
    });

    return session?.user && (
        <Card>
            <CardContent>
                <TrainingAppointmentCalendar appointments={appointments as TrainingAppointmentWithAll[]}
                                             isTrainingStaff={["TA", "ATA"].some((sp) => session.user.staffPositions.includes(sp as StaffPosition))}/>
            </CardContent>
        </Card>
    );
}