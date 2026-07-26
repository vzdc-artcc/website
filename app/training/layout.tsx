import React from 'react';
import {Grid, Stack} from "@mui/material";
import TrainingMenu from "@/components/Admin/TrainingMenu";
import {Metadata} from "next";
import DoubleBookingAlert from "@/components/Training/DoubleBookingAlert";
import RequireRole from "@/components/Access/RequireRole";

export const metadata: Metadata = {
    title: 'Training | vZDC',
    description: 'vZDC training admin page',
};

const {BUFFER_TIME} = process.env;

export default function Layout({children}: { children: React.ReactNode }) {

    return (
        <RequireRole check="isMentor">
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
        </RequireRole>
    );
}
