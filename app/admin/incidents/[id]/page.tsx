import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Card, CardContent, Chip, Grid, Stack, Typography} from "@mui/material";
import IncidentCloseButton from "@/components/Incident/IncidentCloseButton";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const incident = await prisma.incidentReport.findUnique({
        where: {
            id,
        },
        include: {
            reportee: true,
            reporter: true,
        }
    });

    if (!incident) {
        notFound();
    }

    return (
        (<Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">Incident Report</Typography>
                    <Chip label={incident.closed ? 'CLOSED' : 'OPEN'} color={incident.closed ? 'success' : 'warning'}/>
                </Stack>
                <Typography variant="subtitle2">{incident.timestamp.toUTCString()}</Typography>
                <Grid container columns={2} spacing={2} sx={{mt: 1,}}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reporter</Typography>
                        <Typography>{incident.reporter.firstName} {incident.reporter.lastName} ({incident.reporter.cid})</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reporter Email</Typography>
                        <Typography>{incident.reporter.email}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reporter CID</Typography>
                        <Typography>{incident.reporter.cid}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reported Controller</Typography>
                        <Typography>{incident.reportee.firstName} {incident.reportee.lastName} ({incident.reportee.cid})</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Controller Callsign</Typography>
                        <Typography>{incident.reporteeCallsign || 'N/A'}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Reporter Callsign</Typography>
                        <Typography>{incident.reporterCallsign || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <Typography variant="subtitle2">Description</Typography>
                        <Typography>{incident.reason}</Typography>
                    </Grid>
                    {!incident.closed && <Grid size={2}>
                        <IncidentCloseButton incident={incident}/>
                    </Grid>}
                </Grid>
            </CardContent>
        </Card>)
    );
}