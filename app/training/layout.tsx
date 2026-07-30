import React from 'react';
import {Grid, Stack} from "@mui/material";
import TrainingMenu from "@/components/Admin/TrainingMenu";
import {Metadata} from "next";
import DoubleBookingAlert from "@/components/Training/DoubleBookingAlert";
import RequirePermission from "@/components/Access/RequirePermission";

export const metadata: Metadata = {
    title: 'Training | vZDC',
    description: 'vZDC training admin page',
};

// BUFFER_TIME is a server-side runtime env var — read it per-request, not at
// module scope, so it isn't baked at build time. force-dynamic covers the
// training routes rendered under this layout.
export const dynamic = 'force-dynamic';

export default function Layout({children}: { children: React.ReactNode }) {
    const {BUFFER_TIME} = process.env;

    return (
        <RequirePermission perm="pages.training_admin.read">
            <Grid container columns={9} spacing={2}>
                <Grid
                    size={{
                        xs: 9,
                        lg: 2
                    }}>
                    <TrainingMenu/>
                </Grid>
                <Grid size="grow">
                    <Stack direction="column" spacing={2}>
                        <DoubleBookingAlert bufferTimeMinutes={BUFFER_TIME}/>
                        {children}
                    </Stack>
                </Grid>
            </Grid>
        </RequirePermission>
    );
}
