import React from 'react';
import {Box, Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import BroadcastTable from "@/components/Broadcast/BroadcastTable";

export default async function Page() {

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{mb: 2,}}>
                    <Box>
                        <Typography variant="h5">Active Broadcasts</Typography>
                    </Box>

                    <Link href="/admin/broadcasts/new">
                        <Button variant="contained" size="large" startIcon={<Add/>}>New Broadcast</Button>
                    </Link>
                </Stack>
                <BroadcastTable/>
            </CardContent>
        </Card>
    );

}
