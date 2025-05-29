import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import TrainingAssignmentTable from "@/components/TrainingAssignment/TrainingAssignmentTable";
import {Add} from "@mui/icons-material";
import Link from "next/link";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const isTaOrAta = session?.user?.staffPositions.includes('TA') || session?.user?.staffPositions.includes('ATA');

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="h5">Trainer Assignments</Typography>
                    {isTaOrAta && <Link href="/training/assignments/new" passHref>
                        <Button variant="contained" startIcon={<Add/>}>Manual Training Assignment</Button>
                    </Link>}
                </Stack>
                <TrainingAssignmentTable manageMode={!!isTaOrAta} timezone={session?.user.timezone || ''}/>
            </CardContent>
        </Card>
    );
}