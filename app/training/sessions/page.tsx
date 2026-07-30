import React from 'react';
import {Button, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import TrainingSessionTable from "@/components/TrainingSession/TrainingSessionTable";

export default function Page() {

    return (
        <>
            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{mb: 2,}}>
                <Typography variant="h5">Training Sessions</Typography>
                <Link href="/training/sessions/new">
                    <Button variant="contained" size="large" startIcon={<Add/>}>New Training Session</Button>
                </Link>
            </Stack>
            <TrainingSessionTable admin/>
        </>
    );

}
