import React from 'react';
import {Typography} from "@mui/material";
import TrainingSessionForm from "@/components/TrainingSession/TrainingSessionForm";
import prisma from "@/lib/db";
import {notFound, permanentRedirect} from "next/navigation";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const trainingSession = await prisma.trainingSession.findUnique({
        where: {
            id: params.id
        },
        include: {
            instructor: true,
        }
    });

    if (!trainingSession) {
        notFound();
    }

    const session = await getServerSession(authOptions);

    if (session?.user.roles.includes("MENTOR") && trainingSession.instructor.id !== session.user.id) {
        permanentRedirect(`/training/sessions/${params.id}`);
    }

    return session?.user && (
        <>
            <Typography variant="h5" sx={{mb: 2,}}>Edit Training Session</Typography>
            <TrainingSessionForm trainingSession={trainingSession} timeZone={session.user.timezone}/>
        </>
    );
}