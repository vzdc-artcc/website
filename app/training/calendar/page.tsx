import React from 'react';
import {Box, Card, CardContent, FormControlLabel, Switch} from "@mui/material";
import TrainingAppointmentCalendar, {
    TrainingAppointmentWithAll
} from "@/components/TrainingAppointment/TrainingAppointmentCalendar";
import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {StaffPosition} from "@prisma/client";
import Link from "next/link";

export default async function Page({searchParams}: { searchParams: Promise<{ you: string, }>, }) {

    const session = await getServerSession(authOptions);

    const filterBy = (await searchParams).you === 'true' ? session?.user.id : undefined;

    const appointments = await prisma.trainingAppointment.findMany({
        include: {
            student: true,
            trainer: true,
            lessons: true,
        },
        where: {
            trainerId: filterBy,
        },
    });

    return session?.user && (
        <Card>
            <CardContent>
                <Box sx={{mb: 2,}}>
                    <Link href={`/training/calendar?you=${filterBy ? 'false' : 'true'}`}
                          style={{color: 'inherit', textDecoration: 'none'}}>
                        <FormControlLabel control={<Switch checked={!!filterBy}/>} label="Only show my appointments"/>
                    </Link>
                </Box>
                <TrainingAppointmentCalendar appointments={appointments as TrainingAppointmentWithAll[]}
                                             isTrainingStaff={["TA", "ATA"].some((sp) => session.user.staffPositions.includes(sp as StaffPosition))}/>
            </CardContent>
        </Card>
    );
}