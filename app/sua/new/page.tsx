import React from 'react';
import {Card, CardContent, Container, Typography} from "@mui/material";
import SuaRequestForm from "@/components/SuaRequest/SuaRequestForm";
import RequireAuth from "@/components/Access/RequireAuth";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Mission Details | vZDC',
    description: 'vZDC mission details page',
};

// SUAS is a server-side runtime env var — read it per-request, not at module
// scope, so this page doesn't bake its value (or an empty list) at build time.
export const dynamic = 'force-dynamic';

export default function Page() {
    const allSuas = (process.env['SUAS'] as string || '').split(',');

    return (
        <RequireAuth>
            <Container maxWidth="md">
                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{mb: 2,}}>vSOA Scheduling Request</Typography>
                        <SuaRequestForm allSuas={allSuas.sort((a, b) => a.localeCompare(b))}/>
                    </CardContent>
                </Card>
            </Container>
        </RequireAuth>
    );
}
