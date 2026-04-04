import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Alert, Button, Card, CardActions, CardContent, Chip, Grid, Stack, Typography} from "@mui/material";
import ProfileCard from "@/components/Profile/ProfileCard";
import CertificationsCard from "@/components/Profile/CertificationsCard";
import FeedbackCard from "@/components/Profile/FeedbackCard";
import TrainingCard from "@/components/Profile/TrainingCard";
import LinksCard from "@/components/Profile/LinksCard";
import EventsCard from "@/components/Profile/EventsCard";
import prisma from "@/lib/db";
import LoaDeleteButton from "@/components/LOA/LoaDeleteButton";
import Link from "next/link";
import {Edit} from "@mui/icons-material";
import {LOAStatus} from "@prisma/client";
import AssignedTrainersCard from "@/components/Profile/AssignedTrainersCard";
import ProgressionCard from "@/components/Profile/ProgressionCard";
import {formatTimezoneDate, getTimeIn} from "@/lib/date";
import CompletePreparationButton from "@/components/TrainingAppointment/CompletePreparationButton";
import SessionJoinInstructionsButton from "@/components/TrainingAppointment/SessionJoinInstructionsButton";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const user = session?.user;

    const loa = await prisma.lOA.findFirst({
        where: {
            userId: user?.id,
            status: {
                not: "INACTIVE",
            },
        },
    });

    const nowMinus15Minutes = new Date(Date.now() - 15 * 60 * 1000);

    const trainingAppointment = await prisma.trainingAppointment.findFirst({
        where: {
            studentId: user?.id || "",
            start: {
                gte: nowMinus15Minutes,
            },
        },
        orderBy: {
            start: "asc",
        },
        include: {
            trainer: true,
            lessons: true,
        }
    });

    const getLoaColor = (status: LOAStatus) => {
        switch (status) {
            case "APPROVED":
                return "success";
            case "DENIED":
                return "error";
            case "PENDING":
                return "warning";
            default:
                return "info";
        }
    }

    return user && (
        <Grid container columns={6} spacing={2}>
            <Grid size={6}>
                <Typography variant="h4">Your Profile</Typography>
            </Grid>
            {trainingAppointment && <Grid size={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Training
                            Appointment: {trainingAppointment.trainer.fullName}</Typography>
                        <Typography
                            variant="subtitle2">{formatTimezoneDate(trainingAppointment.start, user.timezone)}
                            - {trainingAppointment.start.getTime() < (new Date()).getTime() ? 'NOW' : getTimeIn(trainingAppointment.start)}</Typography>
                        <Typography variant="subtitle2" gutterBottom>{trainingAppointment.lessons.map(l => l.duration)
                            .reduce((acc: number, curr: number) => acc + curr, 0)} minutes</Typography>
                        {trainingAppointment.lessons.map((lesson) => {
                            return (
                                <Chip key={lesson.id} size="small" label={lesson.identifier} sx={{mr: 1,}}/>
                            )
                        })}
                        <Alert severity="info" sx={{mt: 2,}}>To reschedule this session or to cancel it, contact the
                            trainer. Last minute changes might not be honored and may result in disciplinary
                            action.</Alert>
                    </CardContent>
                    <CardActions>
                        <SessionJoinInstructionsButton trainingAppointment={trainingAppointment}/>
                        <CompletePreparationButton trainingAppointment={trainingAppointment}
                                                   lessons={trainingAppointment.lessons}/>
                    </CardActions>
                </Card>
            </Grid>}
            {loa && <Grid size={6}>
                <Card>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1,}}>
                            <Typography variant="h6">Active LOA Request</Typography>
                            <Chip label={loa.status} color={getLoaColor(loa.status)}/>
                        </Stack>
                        <Typography
                            variant="subtitle2">{loa.start.toDateString()} - {loa.end.toDateString()}</Typography>
                    </CardContent>
                    <CardActions>
                        <Link href="/profile/loa/modify">
                            <Button variant="contained" startIcon={<Edit/>}>
                                Modify
                            </Button>
                        </Link>
                        <LoaDeleteButton loa={loa}/>
                    </CardActions>
                </Card>
            </Grid>}
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <ProfileCard user={user}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <AssignedTrainersCard user={user}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <CertificationsCard cid={user.cid}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4
                }}>
                <ProgressionCard user={user}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <LinksCard/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4
                }}>
                <FeedbackCard user={user}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <EventsCard user={user}/>
            </Grid>
            <Grid
                size={8}>
                <TrainingCard user={user}/>
            </Grid>

        </Grid>
    );
}