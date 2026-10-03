import React from 'react';
import {Card, CardContent, Container, Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";

function ErrorCard({heading, message}: { heading: string, message: string }) {
    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Typography variant="h5">{heading}</Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: "center",
                            mt: 2
                        }}>
                        <Info color="error"/>
                        <Typography>{message}</Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}

export default ErrorCard;