'use client';
import React from 'react';
import {useParams} from 'next/navigation';
import {Box, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography} from "@mui/material";
import IncidentCloseButton from "@/components/Incident/IncidentCloseButton";
import {useIncidentItem} from "@/lib/osmium/hooks/incidents";
import {formatZuluDate} from "@/lib/date";

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data: incident, isLoading, isError} = useIncidentItem(params.id);

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !incident) {
        return <Typography>Incident not found.</Typography>;
    }

    return (
        (<Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">Incident Report</Typography>
                    <Chip label={incident.closed ? 'CLOSED' : 'OPEN'} color={incident.closed ? 'success' : 'warning'}/>
                </Stack>
                <Typography variant="subtitle2">{formatZuluDate(new Date(incident.timestamp))}</Typography>
                <Grid container columns={2} spacing={2} sx={{mt: 1,}}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reporter</Typography>
                        <Typography>{incident.reporter_name} {incident.reporter_cid && `(${incident.reporter_cid})`}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reported Controller</Typography>
                        <Typography>{incident.reportee_name} {incident.reportee_cid && `(${incident.reportee_cid})`}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Controller Callsign</Typography>
                        <Typography>{incident.reportee_callsign || 'N/A'}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reporter Callsign</Typography>
                        <Typography>{incident.reporter_callsign || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <Typography variant="subtitle2">Description</Typography>
                        <Typography>{incident.reason}</Typography>
                    </Grid>
                    {!incident.closed && <Grid size={2}>
                        <IncidentCloseButton incidentId={incident.id}/>
                    </Grid>}
                </Grid>
            </CardContent>
        </Card>)
    );
}
