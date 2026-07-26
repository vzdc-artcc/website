import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainingProgressionForm from "@/components/TrainingProgression/TrainingProgressionForm";
import RequireRole from "@/components/Access/RequireRole";

export default function Page() {

    return (
        <RequireRole check="isStaff">
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>New Training Progression</Typography>
                    <TrainingProgressionForm/>
                </CardContent>
            </Card>
        </RequireRole>
    );
}
