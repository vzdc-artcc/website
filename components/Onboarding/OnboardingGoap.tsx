'use client';
import React, {useEffect} from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {fetchAdminDocs} from "@/actions/files";
import {Alert, Box, Button, CircularProgress, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {ArrowBack, Check, OpenInNew} from "@mui/icons-material";

export default function OnboardingGoap({moveNext, moveBack,}: OnboardingStepProps) {

    const [adminDocs, setAdminDocs] = React.useState<{ goap?: string, trainingOrder?: string } | null>(null);

    useEffect(() => {
        fetchAdminDocs().then(setAdminDocs);
    }, []);

    return (
        <>
            <Stack direction="column" spacing={2} sx={{width: '100%',}}>
                <Typography variant="h5">General Operating and Administrative Policy</Typography>
                {!adminDocs && <CircularProgress/>}
                <Typography>The General Operating and Administrative Policy (GOAP) prescribes policy for all
                    controllers, home or visiting.</Typography>
                {adminDocs && !adminDocs.goap && <Typography>No GOAP; contact the web team.</Typography>}
                {adminDocs && adminDocs.goap && <Link target="_blank" href={`https://utfs.io/f/${adminDocs.goap}`}
                                                      style={{color: 'inherit',}}><Typography>Click here to view the
                    GOAP. <OpenInNew fontSize="inherit"/></Typography></Link>}
                <Alert severity="warning">You <b>MUST</b> familiarize yourself with the GOAP prior to interacting with
                    the facility. Lack of knowledge of the GOAP is not a valid excuse for violating it.</Alert>
                <Typography>By pressing 'Agree' and/or continuing to be a member of the facility, you agree to all the
                    provisions in the GOAP. You also agree to follow the Standard Operating Procedures (SOPs) and
                    Letters of Agreement (LOAs) for any facility controlled.</Typography>
            </Stack>
            <Box>
                <Button variant="outlined" color="inherit" startIcon={<ArrowBack/>} onClick={moveBack}
                        sx={{mr: 2,}}>Back</Button>
                <Button variant="contained" startIcon={<Check/>} onClick={moveNext}>I agree to the GOAP</Button>
            </Box>
        </>
    );
}