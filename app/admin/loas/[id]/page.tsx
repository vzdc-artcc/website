'use client';
import React from 'react';
import {useParams} from 'next/navigation';
import {Box, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography} from "@mui/material";
import LoaDecisionForm from "@/components/LOA/LOADecisionForm";
import {useAdminLoas} from "@/lib/osmium/hooks/loa";

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data, isLoading, isError} = useAdminLoas({pageSize: 200});
    const loa = data?.items.find((item) => item.id === params.id);

    const getLoaColor = (status: string) => {
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

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !loa) {
        return <Typography>LOA not found.</Typography>;
    }

    return (
        (<Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">Leave of Absence</Typography>
                    <Chip label={loa.status} color={getLoaColor(loa.status)}/>
                </Stack>
                <Typography
                    variant="subtitle2">{loa.display_name} ({loa.cid})</Typography>
                <Grid container spacing={2} columns={2} sx={{mt: 2, mb: 4,}}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Start</Typography>
                        <Typography variant="body2">{new Date(loa.start).toDateString()}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">End</Typography>
                        <Typography variant="body2">{new Date(loa.end).toDateString()}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <Typography variant="subtitle2">Reason for LOA</Typography>
                        <Typography variant="body2">{loa.reason}</Typography>
                    </Grid>
                    {loa.status === "PENDING" && <Grid size={2}>
                        <LoaDecisionForm loa={loa}/>
                    </Grid>}
                </Grid>
            </CardContent>
        </Card>)
    );
}
