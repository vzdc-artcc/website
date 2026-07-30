import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainingAssignmentForm from "@/components/TrainingAssignment/TrainingAssignmentForm";
import RequireStaffPosition from "@/components/Access/RequireStaffPosition";

export default function Page() {

    return (
        <RequireStaffPosition positions={['TA', 'ATA']}>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>New Training Assignment</Typography>
                    <TrainingAssignmentForm/>
                </CardContent>
            </Card>
        </RequireStaffPosition>
    );
}
