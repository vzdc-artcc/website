import React from 'react';
import { Card, CardContent, Container, Divider, Stack, Typography } from "@mui/material";
import { Metadata } from "next";
import DataExportCard from "@/components/Profile/DataExportCard";

export const metadata: Metadata = {
    title: 'Privacy | vZDC',
    description: 'vZDC privacy policy and your data rights',
};

export default async function Page() {
    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="h4">Privacy &amp; Your Data</Typography>
                        <Typography color="text.secondary">
                            The Virtual Washington ARTCC (vZDC) is a volunteer flight-simulation
                            community operating on the VATSIM network, and follows the guidelines of
                            VATUSA and VATSIM. This page explains what personal data we hold, how it is
                            used, and how you can exercise your rights over it.
                        </Typography>

                        <Divider />

                        <Typography variant="h6">Information we hold</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your VATSIM identity (CID, name, email, rating and division), your controller
                            and roster status, training records (sessions, appointments, assignments and
                            progression), event participation, feedback and incident reports you submit or
                            that concern you, workflow requests (LOAs, staffing, SUAs), and technical
                            metadata such as request IP addresses used for security and abuse prevention.
                        </Typography>

                        <Typography variant="h6">How we use it</Typography>
                        <Typography variant="body2" color="text.secondary">
                            To operate the ARTCC — maintaining the roster, running training and events,
                            and communicating with members. We synchronize roster and rating data with
                            VATUSA/VATSIM, and training staff can see the training records needed to
                            mentor you. We do not sell your data.
                        </Typography>

                        <Typography variant="h6">Your rights</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Under GDPR you have the right to access, receive a portable copy of, rectify,
                            and (subject to records we are required to retain) request erasure of your
                            personal data. You can download a full copy of your data at any time using the
                            button below; the exported file also includes a detailed notice describing how
                            your data is processed.
                        </Typography>

                        <Divider />

                        <DataExportCard />

                        <Divider />

                        <Typography variant="subtitle2">
                            Questions? Email{' '}
                            <a href="mailto:zdc_staff@vatusa.net">zdc_staff@vatusa.net</a>.
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}
