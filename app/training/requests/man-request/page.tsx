import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainerRequestManualForm from "@/components/TrainerAssignmentRequest/TrainerRequestManualForm";

export default function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Manual Trainer Request Form</Typography>
                <TrainerRequestManualForm/>
            </CardContent>
        </Card>
    );
}
