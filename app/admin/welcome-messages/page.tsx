import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import prisma from "@/lib/db";
import WelcomeMessagesForm from "@/components/WelcomeMessages/WelcomeMessagesForm";

export default async function Page() {

    const welcomeMessages = await prisma.welcomeMessages.findFirst();

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>ARTCC Welcome Messages</Typography>
                <WelcomeMessagesForm existing={welcomeMessages || undefined}/>
            </CardContent>
        </Card>
    );

}