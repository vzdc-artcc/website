import React from 'react';
import {Card, CardContent, Container, Stack, Typography} from "@mui/material";
import {CheckCircle} from "@mui/icons-material";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Visitor Request Success | vZDC',
    description: 'vZDC visitor request page',
};

export default function Page() {
    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2
                        }}>
                        <CheckCircle color="success" fontSize="large"/>
                        <Typography variant="h5">Application Submitted</Typography>
                    </Stack>
                    <Container maxWidth="sm">
                        <Typography>Your visiting application was submitted successfully. You should receive an email
                            about your application within 7 business days.</Typography>
                    </Container>
                </CardContent>
            </Card>
        </Container>
    );
}