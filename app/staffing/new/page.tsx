import React from 'react';
import {Card, CardContent, Container, Typography} from "@mui/material";
import StaffingRequestFormWrapper from "@/components/StaffingRequest/StaffingRequestFormWrapper";
import RequireAuth from "@/components/Access/RequireAuth";
import {Metadata} from "next";
export const metadata: Metadata = {
    title: 'Request Staffing | vZDC',
    description: 'vZDC staffing request page',
};

export default function Page() {

    return (
        <RequireAuth>
            <Container maxWidth="md">
                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{mb: 2,}}>Staffing Request</Typography>
                        <StaffingRequestFormWrapper/>
                    </CardContent>
                </Card>
            </Container>
        </RequireAuth>
    );
}
