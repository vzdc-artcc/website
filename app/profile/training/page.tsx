import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainingSessionTable from "@/components/TrainingSession/TrainingSessionTable";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Training Tickets</Typography>
                <Typography sx={{my: 1,}}>All times in GMT</Typography>
                <TrainingSessionTable selfView/>
            </CardContent>
        </Card>
    );
}
