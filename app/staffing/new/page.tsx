import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Card, CardContent, Container, Typography} from "@mui/material";
import StaffingRequestForm from "@/components/StaffingRequest/StaffingRequestForm";

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error("You must be logged in to view this page");
    }


    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>Staffing Request</Typography>
                    <StaffingRequestForm user={session.user}/>
                </CardContent>
            </Card>
        </Container>
    );
}