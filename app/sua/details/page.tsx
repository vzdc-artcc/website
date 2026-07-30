'use client';
import React from 'react';
import {Alert, Box, Card, CardActions, CardContent, CircularProgress, Container, Divider, Stack, Typography} from "@mui/material";
import ErrorCard from "@/components/Error/ErrorCard";
import {formatZuluDate} from "@/lib/date";
import {useSearchParams} from "next/navigation";
import SuaRequestDeleteButton from "@/components/SuaRequest/SuaRequestDeleteButton";
import {useSuaMission} from "@/lib/osmium/hooks/sua";
import {useMe} from "@/lib/osmium/hooks/me";

export default function Page() {

    const searchParams = useSearchParams();
    const missionId = searchParams.get('missionId') || '';
    const {data: suaBlock, isLoading, isError} = useSuaMission(missionId);
    const {data: me} = useMe();

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !suaBlock) {
        return <ErrorCard heading="Special Use Airspace Request" message="Mission not found."/>
    }

    return (
        <Container maxWidth="md">
            <Stack direction="column" spacing={2}>
                <Alert severity="warning">Please understand the disclaimer(s) before exercising your mission.</Alert>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>Mission Information</Typography>
                        <Typography variant="body1">Mission Number: <b>{suaBlock.mission_number}</b></Typography>
                        <Divider sx={{my: 2,}}/>
                        <Typography variant="h6" gutterBottom>Details</Typography>
                        <Typography>{formatZuluDate(new Date(suaBlock.start_at))} - {formatZuluDate(new Date(suaBlock.end_at))}</Typography>
                        <Typography>Affiliated with {suaBlock.afiliation}</Typography>
                        <ul>
                            {suaBlock.airspace.map((a) => (
                                <li key={a.id}>
                                    <Typography variant="body1">
                                        <b>{a.identifier}</b>: FL{a.bottom_altitude} - FL{a.top_altitude}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>Extra Information:</Typography>
                        <Typography>{suaBlock.details}</Typography>
                        <Divider sx={{my: 2,}}/>
                        <Typography variant="h6" gutterBottom>Disclaimer</Typography>
                        <Typography variant="body2" gutterBottom>
                            This mission does <b>not</b> guarantee ATC coverage and cannot be modified once submitted.
                            Please check the vZDC website for current staffing and availability before your mission
                            begins.
                            <br/>
                            <br/>
                            The details provided here will be shared with vZDC controllers. When contacting ATC for
                            clearance, you must reference your mission number. If your mission number includes a letter,
                            it means the booking was made less than 24 hours in advance, and might not be honored.
                            <br/>
                            <br/>
                            Mission accommodation is at the discretion of the controller on duty. You may be asked to
                            adjust or cancel your mission if required for operational reasons.
                            <br/>
                            <br/>
                            All missions are automatically deleted after their scheduled end time. For questions or
                            concerns, please contact vZDC staff directly.
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Box>
                            {me?.cid === suaBlock.cid &&
                                <SuaRequestDeleteButton suaRequest={suaBlock}/>
                            }
                        </Box>
                    </CardActions>
                </Card>
            </Stack>
        </Container>
    );

}
