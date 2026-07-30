'use client';
import React from 'react';
import { Card, CardContent, Typography } from "@mui/material";
import MassEmailForm from "@/components/Mail/MassEmailForm";

export default function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Send Mass Email</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Compose a branded announcement to individual controllers or preset groups. Each
                    recipient is sent individually through osmium (respecting unsubscribes), and the
                    send is recorded in the email outbox and server audit log.
                </Typography>
                <MassEmailForm />
            </CardContent>
        </Card>
    );
}
