'use client';
import React from 'react';
import {Box, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import LoaForm from "@/components/LOA/LOAForm";
import ErrorCard from "@/components/Error/ErrorCard";
import {useMyLoas} from "@/lib/osmium/hooks/loa";

export default function Page() {

    const {data: loasData, isLoading} = useMyLoas();

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    const activeLoa = loasData?.items.find((loa) => loa.status !== 'INACTIVE');

    if (!activeLoa) {
        return <ErrorCard heading="Leave of Absence"
                          message="You do not have an LOA. Try requesting one in your profile"/>
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Leave of Absence</Typography>
                <Typography sx={{mb: 2,}}>You can modify your LOA below. If you make any changes or press save, the LOA
                    will switch back to PENDING. This will CANCEL your previous LOA if it was approved.</Typography>
                <LoaForm loa={activeLoa}/>
            </CardContent>
        </Card>
    );
}
