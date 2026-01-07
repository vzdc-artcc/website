import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import HomeTrainerAssignmentRequestsTable from "@/components/TrainerAssignmentRequest/HomeTrainerAssignmentRequestsTable";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const isTaOrAtaOrWm = session?.user?.staffPositions.includes('TA') || session?.user?.staffPositions.includes('ATA') || session?.user?.staffPositions.includes('WM');

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Home Controller Trainer Assignment Requests</Typography>
                <HomeTrainerAssignmentRequestsTable manageMode={!!isTaOrAtaOrWm} />
            </CardContent>
        </Card>
    );
}