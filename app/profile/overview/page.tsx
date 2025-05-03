import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Alert, Button, Card, CardActions, CardContent, Chip, Grid2, Stack, Typography} from "@mui/material";
import ProfileCard from "@/components/Profile/ProfileCard";
import CertificationsCard from "@/components/Profile/CertificationsCard";
import FeedbackCard from "@/components/Profile/FeedbackCard";
import TrainingCard from "@/components/Profile/TrainingCard";
import LinksCard from "@/components/Profile/LinksCard";
import EventSignupCard from "@/components/Profile/EventSignupCard";
import prisma from "@/lib/db";
import LoaDeleteButton from "@/components/LOA/LoaDeleteButton";
import Link from "next/link";
import {Edit} from "@mui/icons-material";
import {LOAStatus} from "@prisma/client";
import AssignedMentorsCard from "@/components/Profile/AssignedMentorsCard";
import ProgressionCard from "@/components/Profile/ProgressionCard";
import {formatZuluDate, getTimeIn} from "@/lib/date";
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

    const trainingAppointment = await prisma.trainingAppointment.findFirst({
        where: {
            studentId: user?.id || "",
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
        <Grid2 container columns={6} spacing={2}>
            <Grid2 size={6}>
                <Typography variant="h4">Your Profile</Typography>
            </Grid2>
            {trainingAppointment && <Grid2 size={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Training
                            Appointment: {trainingAppointment.trainer.fullName}</Typography>
                        <Typography
                            variant="subtitle2">{formatZuluDate(trainingAppointment.start)} - {trainingAppointment.start.getTime() < (new Date()).getTime() ? 'NOW' : getTimeIn(trainingAppointment.start)}</Typography>
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
            </Grid2>}
            {loa && <Grid2 size={6}>
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
            </Grid2>}
            <Grid2
                size={{
                    xs: 6,
                    md: 2
                }}>
                <ProfileCard user={user}/>
            </Grid2>
            <Grid2
                size={{
                    xs: 6,
                    md: 2
                }}>
                <AssignedMentorsCard user={user}/>
            </Grid2>
            <Grid2
                size={{
                    xs: 6,
                    md: 2
                }}>
                <CertificationsCard cid={user.cid}/>
            </Grid2>
            <Grid2
                size={{
                    xs: 6,
                    md: 4
                }}>
                <ProgressionCard user={user}/>
            </Grid2>
            <Grid2
                size={{
                    xs: 6,
                    md: 2
                }}>
                <LinksCard/>
            </Grid2>
            <Grid2
                size={{
                    xs: 6,
                    md: 4
                }}>
                <FeedbackCard user={user}/>
            </Grid2>
            <Grid2
                size={{
                    xs: 6,
                    md: 2
                }}>
                <EventSignupCard user={user}/>
            </Grid2>
            <Grid2
                size={8}>
                <TrainingCard user={user}/>
            </Grid2>

        </Grid2>
    );
}