import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import TrainingAssignmentTable from "@/components/TrainingAssignment/TrainingAssignmentTable";
import {Add} from "@mui/icons-material";
import Link from "next/link";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const isTaOrAtaOrWm = session?.user?.staffPositions.includes('TA') || session?.user?.staffPositions.includes('ATA') || session?.user?.staffPositions.includes('WM');

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="h5">Trainer Assignments</Typography>
                    {isTaOrAtaOrWm && <Link href="/training/assignments/new" passHref>
                        <Button variant="contained" startIcon={<Add/>}>Manual Training Assignment</Button>
                    </Link>}
                </Stack>
                <TrainingAssignmentTable manageMode={!!isTaOrAtaOrWm} timezone={session?.user.timezone || ''}/>
            </CardContent>
        </Card>
    );
}