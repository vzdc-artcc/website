import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import TrainingAssignmentTable from "@/components/TrainingAssignment/TrainingAssignmentTable";
import {Add} from "@mui/icons-material";
import Link from "next/link";
import RequireStaffPosition from "@/components/Access/RequireStaffPosition";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="h5">Trainer Assignments</Typography>
                    <RequireStaffPosition positions={['TA', 'ATA', 'WM']} silent>
                        <Link href="/training/assignments/new" passHref>
                            <Button variant="contained" startIcon={<Add/>}>Manual Training Assignment</Button>
                        </Link>
                    </RequireStaffPosition>
                </Stack>
                <TrainingAssignmentTable/>
            </CardContent>
        </Card>
    );
}
