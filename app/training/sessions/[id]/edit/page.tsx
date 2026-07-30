import React from 'react';
import {Typography} from "@mui/material";
import TrainingSessionForm from "@/components/TrainingSession/TrainingSessionForm";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const {id} = await props.params;

    return (
        <>
            <Typography variant="h5" sx={{mb: 2,}}>Edit Training Session</Typography>
            <TrainingSessionForm sessionId={id}/>
        </>
    );
}
