'use client';
import React from 'react';
import {useParams} from 'next/navigation';
import {Box, Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import StaffingRequestDecisionForm from "@/components/StaffingRequest/StaffingRequestDecisionForm";
import {useAdminStaffingRequests} from "@/lib/osmium/hooks/staffing";

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data, isLoading, isError} = useAdminStaffingRequests({pageSize: 200});
    const staffingRequest = data?.items.find((item) => item.id === params.id);

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !staffingRequest) {
        return <Typography>Staffing request not found.</Typography>;
    }

    return (
        (<Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>Staffing Request - {staffingRequest.name}</Typography>
                <Grid container columns={2} spacing={2}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Name</Typography>
                        <Typography variant="body2">{staffingRequest.display_name}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">CID</Typography>
                        <Typography variant="body2">{staffingRequest.cid}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Email</Typography>
                        <Typography variant="body2">{staffingRequest.email}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Staffing Name</Typography>
                        <Typography variant="body2">{staffingRequest.name}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <Typography variant="subtitle2">Description</Typography>
                        <Typography variant="body2">{staffingRequest.description}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <StaffingRequestDecisionForm staffingRequest={staffingRequest}/>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>)
    );
}
