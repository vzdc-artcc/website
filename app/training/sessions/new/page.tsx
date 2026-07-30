import React from 'react';
import {Typography} from "@mui/material";
import TrainingSessionForm from "@/components/TrainingSession/TrainingSessionForm";

export default function Page() {

    return (
        <>
            <Typography variant="h5" gutterBottom>New Training Session</Typography>
            <TrainingSessionForm/>
        </>
    );

}
