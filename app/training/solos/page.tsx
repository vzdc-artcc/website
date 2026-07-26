import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import SoloCertificationTable from "@/components/SoloCertification/SoloCertificationTable";
import SolosGate from "@/components/Access/SolosGate";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h5">Active Solo Endorsements</Typography>
                        <Typography>All times are in GMT</Typography>
                    </Stack>
                    <SolosGate silent>
                        <Link href="/training/solos/new">
                            <Button variant="contained" size="large" startIcon={<Add/>}>Grant Solo Endorsement</Button>
                        </Link>
                    </SolosGate>
                </Stack>
                <SoloCertificationTable/>
            </CardContent>
        </Card>
    );

}
