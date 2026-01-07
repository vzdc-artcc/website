import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import VisitTrainerAssignmentRequestsTable from "@/components/TrainerAssignmentRequest/HomeTrainerAssignmentRequestsTable";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const isTaOrAtaOrWm = session?.user?.staffPositions.includes('TA') || session?.user?.staffPositions.includes('ATA') || session?.user?.staffPositions.includes('WM');

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Visiting Controller Trainer Assignment Requests</Typography>
                <VisitTrainerAssignmentRequestsTable manageMode={!!isTaOrAtaOrWm}/>
            </CardContent>
        </Card>
    );
}