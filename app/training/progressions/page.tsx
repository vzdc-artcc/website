import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import TrainingProgressionTable from "@/components/TrainingProgression/TrainingProgressionTable";
import RoleOnly from "@/components/Access/RoleOnly";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{mb: 2,}}>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h5">Training Progressions</Typography>
                    </Stack>
                    <RoleOnly check="isStaff">
                        <Link href="/training/progressions/new">
                            <Button variant="contained" size="large" startIcon={<Add/>}>New Progression</Button>
                        </Link>
                    </RoleOnly>
                </Stack>
                <TrainingProgressionTable/>
            </CardContent>
        </Card>
    );
}
