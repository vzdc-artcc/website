import React from 'react';
import {Typography} from "@mui/material";
import TrainingSessionForm from "@/components/TrainingSession/TrainingSessionForm";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page() {

    const session = await getServerSession(authOptions);

    return session?.user && (
        <>
            <Typography variant="h5" gutterBottom>New Training Session</Typography>
            <TrainingSessionForm timeZone={session.user.timezone}/>
        </>
    );

}