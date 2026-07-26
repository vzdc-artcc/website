import React from 'react';
import {Card, CardContent, Container, Typography} from "@mui/material";
import FeedbackFormWrapper from "@/components/Feedback/FeedbackFormWrapper";
import RequireAuth from "@/components/Access/RequireAuth";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Feedback | vZDC',
    description: 'vZDC feedback page',
};

export default function Page() {

    return (
        <RequireAuth>
            <Container maxWidth="md">
                <Card>
                    <CardContent>
                        <Typography variant="h5">Feedback</Typography>
                        <FeedbackFormWrapper/>
                    </CardContent>
                </Card>
            </Container>
        </RequireAuth>
    );

}
