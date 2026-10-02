import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import InnovationLabProjectForm from "@/components/InnovationLab/InnovationLabProjectForm";

export default async function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New Innovation Lab Project</Typography>
                <InnovationLabProjectForm/>
            </CardContent>
        </Card>
    );
}