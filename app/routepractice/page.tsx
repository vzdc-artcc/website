import React from 'react';
import {
    Card,
    CardContent,
    Typography
} from "@mui/material";
import RoutePracticeForm from '@/components/RoutePractice/RoutePracticeForm'
import generateRandomFlightPlan from '@/components/RoutePractice/RandomFlightPlan';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Flight Plan Practice | vZDC',
    description: 'vZDC flight plan practice page',
};

export default async function Page() {
    const flightPlan = generateRandomFlightPlan();

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Flight Plan Practice</Typography>
                <div style={{alignItems:"center"}}>
                    <RoutePracticeForm initialPlan={flightPlan}/>
                </div>
            </CardContent>

        </Card>

    );
}