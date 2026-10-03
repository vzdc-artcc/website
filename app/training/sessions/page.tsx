import React from 'react';
import {Button, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import TrainingSessionTable from "@/components/TrainingSession/TrainingSessionTable";

export default async function Page() {

    const session = await getServerSession(authOptions);
    let isInstructor = false;
    const mentorCID = session!.user.cid;

    if (session!.user.roles.includes("INSTRUCTOR") || session!.user.roles.includes("STAFF")){
        isInstructor = true;
    }

    return (
        <>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    justifyContent: "space-between",
                    mb: 2
                }}>
                <Typography variant="h5">Training Sessions</Typography>
                <Link href="/training/sessions/new">
                    <Button variant="contained" size="large" startIcon={<Add/>}>New Training Session</Button>
                </Link>
            </Stack>
            <TrainingSessionTable admin isInstructor={isInstructor} mentorCID={mentorCID}/>
        </>
    );

}