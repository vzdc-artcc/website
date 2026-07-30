import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainerAssignmentRequestsTable from "@/components/TrainerAssignmentRequest/TrainerAssignmentRequestsTable";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Visiting Controller Trainer Assignment Requests</Typography>
                <TrainerAssignmentRequestsTable controllerStatus="VISITOR"/>
            </CardContent>
        </Card>
    );
}
