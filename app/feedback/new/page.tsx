import React from 'react';
import {Card, CardContent, Container, Typography} from "@mui/material";
import FeedbackForm from "@/components/Feedback/FeedbackForm";
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
                        <FeedbackForm/>
                    </CardContent>
                </Card>
            </Container>
        </RequireAuth>
    );

}
