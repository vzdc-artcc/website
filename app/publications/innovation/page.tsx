import React from 'react';
import prisma from "@/lib/db";
import {Alert, Card, CardContent, Typography} from "@mui/material";
import InnovationLabTabs from "@/components/InnovationLab/InnovationLabTabs";

export default async function Page({searchParams}: { searchParams: Promise<{ alias?: string }> }) {

    const {alias} = await searchParams;

    const projects = await prisma.innovationLabProject.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Innovation Center</Typography>
                <Alert severity="info">Projects in the Innovation Lab are <b>optional</b> and are not mandated unless
                    stated in official documentation.</Alert>
                <InnovationLabTabs projects={projects} alias={alias}/>
            </CardContent>
        </Card>
    );
}