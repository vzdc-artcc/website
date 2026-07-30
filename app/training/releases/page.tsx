import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainerReleaseRequestTable from "@/components/TrainerReleaseRequest/TrainerReleaseRequestTable";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Trainer Release Requests</Typography>
                <TrainerReleaseRequestTable/>
            </CardContent>
        </Card>
    );
}
