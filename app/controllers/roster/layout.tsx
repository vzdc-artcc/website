import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import RosterSearch from "@/components/Roster/RosterSearch";
import RosterTabs from "@/components/Roster/RosterTabs";
import {Metadata} from "next";
import RosterLegend from "@/components/Roster/RosterLegend";

export const metadata: Metadata = {
    title: 'Roster | vZDC',
    description: 'vZDC roster page',
};

export const revalidate = 300;

export default async function Layout({children}: { children: React.ReactNode }) {

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <RosterLegend/>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Controller Roster</Typography>
                    <RosterSearch/>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <RosterTabs/>
                    {children}
                </CardContent>
            </Card>
        </Stack>
    );
}