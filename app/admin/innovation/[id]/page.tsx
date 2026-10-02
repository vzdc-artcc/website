import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import InnovationLabProjectForm from "@/components/InnovationLab/InnovationLabProjectForm";
import {notFound} from "next/navigation";
import prisma from "@/lib/db";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    const project = await prisma.innovationLabProject.findUnique({
        where: {
            id,
        },
    });

    if (!project) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Edit Innovation Lab Project</Typography>
                <InnovationLabProjectForm project={project}/>
            </CardContent>
        </Card>
    );
}