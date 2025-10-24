import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import SoloCertificationTable from "@/components/SoloCertification/SoloCertificationTable";

export default async function Page() {

    const session = await getServerSession(authOptions);

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h5">Active Solo Endorsements</Typography>
                        <Typography>All times are in GMT</Typography>
                    </Stack>
                    {(session?.user.roles.includes("INSTRUCTOR") || session?.user.staffPositions.includes("WM")) && <Link href="/training/solos/new">
                        <Button variant="contained" size="large" startIcon={<Add/>}>Grant Solo Endorsement</Button>
                    </Link>}
                </Stack>
                <SoloCertificationTable/>
            </CardContent>
        </Card>
    );

}