import React from 'react';
import {Card, CardContent, Container, Stack, Typography} from "@mui/material";
import {CheckCircle} from "@mui/icons-material";

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
                        <Typography variant="h5">Feedback Submitted</Typography>
                    </Stack>
                    <Container maxWidth="sm">
                        <Typography>Thank you for your feedback! If necessary, you will receive an email from one of our
                            staff within 7 business days.</Typography>
                    </Container>
                </CardContent>
            </Card>
        </Container>
    );

}