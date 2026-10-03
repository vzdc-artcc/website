import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import PerformanceIndicatorTable from "@/components/PerformanceIndicator/PerformanceIndicatorTable";

export default async function Page() {

    const session = await getServerSession(authOptions);

    return (
        <Card>
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        justifyContent: "space-between",
                        mb: 2
                    }}>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h5">Performance Indicators</Typography>
                    </Stack>
                    {session?.user.roles.includes("STAFF") && <Link href="/training/indicators/new">
                        <Button variant="contained" size="large" startIcon={<Add/>}>New Performance Indicator</Button>
                    </Link>}
                </Stack>
                <PerformanceIndicatorTable admin={session?.user.roles.includes("STAFF")}/>
            </CardContent>
        </Card>
    );
}