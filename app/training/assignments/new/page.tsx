import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainingAssignmentForm from "@/components/TrainingAssignment/TrainingAssignmentForm";
import RequirePermission from "@/components/Access/RequirePermission";

export default function Page() {

    return (
        <RequirePermission perm="training.assignments.create">
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>New Training Assignment</Typography>
                    <TrainingAssignmentForm/>
                </CardContent>
            </Card>
        </RequirePermission>
    );
}
