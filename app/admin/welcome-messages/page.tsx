import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import WelcomeMessagesForm from "@/components/WelcomeMessages/WelcomeMessagesForm";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>ARTCC Welcome Messages</Typography>
                <WelcomeMessagesForm/>
            </CardContent>
        </Card>
    );

}