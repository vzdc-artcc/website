'use client';
import React from 'react';
import {Box, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import VisitorForm from "@/components/Visitor/VisitorForm";
import ErrorCard from "@/components/Error/ErrorCard";
import {useMyVisitorApplication} from "@/lib/osmium/hooks/visitor";

export default function VisitorApplicationView() {

    const {data: application, isLoading} = useMyVisitorApplication();

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (application && application.status === 'PENDING') {
        return <ErrorCard heading="Visitor Application" message="You already have a pending visiting application."/>
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Visitor Application</Typography>
                <Typography sx={{my: 1,}}>We appreciate your interest in visiting the Virtual Washington ARTCC. Fill
                    out the following form and a staff member will take a look at your application. This process
                    might take up to 7 business days.</Typography>
                <VisitorForm/>
            </CardContent>
        </Card>
    );
}
