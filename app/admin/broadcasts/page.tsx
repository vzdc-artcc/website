import React from 'react';
import {Box, Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import BroadcastTable from "@/components/Broadcast/BroadcastTable";
import {deleteStaleBroadcasts} from "@/actions/broadcast";

export default async function Page() {

    await deleteStaleBroadcasts();

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
                    <Box>
                        <Typography variant="h5">Active Broadcasts</Typography>
                        <Typography>Broadcasts are automatically deleted 6 months after they were last
                            updated.</Typography>
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