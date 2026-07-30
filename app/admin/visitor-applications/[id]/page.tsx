'use client';
import React from 'react';
import {useParams} from 'next/navigation';
import {Box, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography} from "@mui/material";
import VisitorApplicationDecisionForm from "@/components/VisitorApplication/VisitorApplicationDecisionForm";
import {useAdminVisitorApplications} from "@/lib/osmium/hooks/visitor";
import {useUserByCid} from "@/lib/osmium/hooks/users";

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data, isLoading, isError} = useAdminVisitorApplications({pageSize: 200});
    const application = data?.items.find((item) => item.id === params.id);
    const {data: applicant} = useUserByCid(application?.cid ?? undefined);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'APPROVED':
                return 'success';
            case 'DENIED':
                return 'error';
            default:
                return 'default';
        }
    }

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !application) {
        return <Typography>Visitor application not found.</Typography>;
    }

    const rating = applicant?.basic.rating;

    return (
        (<Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">Visitor Application</Typography>
                    <Chip label={application.status} color={getStatusColor(application.status)}/>
                </Stack>
                <Typography
                    variant="subtitle2">{application.display_name} ({application.cid})</Typography>
                <Typography variant="subtitle2">{new Date(application.submitted_at).toUTCString()}</Typography>
                <Grid container spacing={2} columns={2} sx={{mt: 2, mb: 4,}}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">CID</Typography>
                        <Typography variant="body2">{application.cid}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Rating</Typography>
                        <Typography variant="body2">{rating || 'N/A'}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Home Facility</Typography>
                        <Typography variant="body2">{application.home_facility}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <Typography variant="subtitle2">Reason for Visiting</Typography>
                        <Typography variant="body2">{application.why_visit}</Typography>
                    </Grid>
                    {application.status === "DENIED" && <Grid size={2}>
                        <Typography variant="subtitle2">Reason for Denial</Typography>
                        <Typography variant="body2">{application.reason_for_denial || 'N/A'}</Typography>
                    </Grid>}
                </Grid>
                {application.status === "PENDING" &&
                    <VisitorApplicationDecisionForm application={application}/>}
            </CardContent>
        </Card>)
    );
}
