import React from 'react';
import prisma from "@/lib/db";
import {Alert, Card, CardContent, Typography} from "@mui/material";
import InnovationLabTabs from "@/components/InnovationLab/InnovationLabTabs";

export default async function Page({searchParams}: { searchParams: Promise<{ startingAlias?: string }> }) {

    const {startingAlias} = await searchParams;

    const projects = await prisma.innovationLabProject.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Innovation Center</Typography>
                <Alert severity="info" sx={{mb: 2,}}>Usage of projects in the Innovation Lab are <b>optional</b> and are
                    not mandated unless
                    stated in official documentation or publication.</Alert>
                <InnovationLabTabs projects={projects} startingAlias={startingAlias}/>
            </CardContent>
        </Card>
    );
}