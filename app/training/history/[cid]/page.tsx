import React from 'react';
import TrainingSessionTable from '@/components/TrainingSession/TrainingSessionTable';
import {Box, Typography} from "@mui/material";

export default async function Page(props: { params: Promise<{ cid: string, }>, }) {
    const {cid} = await props.params;

    return (
        <Box>
            <Typography variant="h5" sx={{mb: 1,}}>Training Sessions</Typography>
            <TrainingSessionTable admin studentCid={cid}/>
        </Box>
    );
}
