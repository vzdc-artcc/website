'use client';
import React from 'react';
import {Box, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import LoaForm from "@/components/LOA/LOAForm";
import ErrorCard from "@/components/Error/ErrorCard";
import {useMyLoas} from "@/lib/osmium/hooks/loa";

export default function LoaRequestView() {

    const {data: loasData, isLoading} = useMyLoas();

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    const activeLoa = loasData?.items.find((loa) => loa.status !== 'INACTIVE');

    if (activeLoa) {
        return <ErrorCard heading="Leave of Absence Request" message="You already have an active LOA."/>
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Leave of Absence Request</Typography>
                <Typography sx={{mb: 2,}}>Your LOA will be submitted to staff for approval.</Typography>
                <LoaForm/>
            </CardContent>
        </Card>
    );
}
