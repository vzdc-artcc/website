import React from 'react';
import {Card, CardContent, Container, Stack, Typography} from "@mui/material";
import {CheckCircle} from "@mui/icons-material";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Staffing Request Success | vZDC',
    description: 'vZDC staffing request success page',
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
                        <Typography variant="h5">Request Submitted</Typography>
                    </Stack>
                    <Container maxWidth="sm">
                        <Typography>You will receive an email from our staff within 7 business days regarding your
                            request.</Typography>
                    </Container>
                </CardContent>
            </Card>
        </Container>
    );

}