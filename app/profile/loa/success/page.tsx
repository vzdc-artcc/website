import React from 'react';
import {Box, Button, Card, CardContent, Container, Stack, Typography} from "@mui/material";
import {CheckCircle, Settings} from "@mui/icons-material";
import Link from "next/link";

export default function Page() {
    return (
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
                    <Typography variant="h5">LOA Submitted</Typography>
                </Stack>
                <Container maxWidth="sm">
                    <Typography>Your LOA has been submitted successfully! You should receive an email with an update
                        within 7 business days. Feel free to modify or delete your L.O.A request at any time on the
                        profile page.</Typography>
                    <Box sx={{mt: 2, textAlign: 'center',}}>
                        <Link href="/profile/overview">
                            <Button variant="contained" size="large" startIcon={<Settings/>}>
                                Profile
                            </Button>
                        </Link>
                    </Box>
                </Container>
            </CardContent>
        </Card>
    );
}