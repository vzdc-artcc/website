import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import ProgressionAssignmentForm from "@/components/ProgressionAssignment/ProgressionAssignmentForm";
import RequireRole from "@/components/Access/RequireRole";

export default function Page() {

    return (
        <RequireRole check="isStaff">
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>New Progression Assignment</Typography>
                    <ProgressionAssignmentForm/>
                </CardContent>
            </Card>
        </RequireRole>
    );
}
