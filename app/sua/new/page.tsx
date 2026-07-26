import React from 'react';
import {Card, CardContent, Container, Typography} from "@mui/material";
import SuaRequestForm from "@/components/SuaRequest/SuaRequestForm";
import RequireAuth from "@/components/Access/RequireAuth";
import {Metadata} from "next";

const allSuas = (process.env['SUAS'] as string || '').split(',');

export const metadata: Metadata = {
    title: 'Mission Details | vZDC',
    description: 'vZDC mission details page',
};


export default function Page() {

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
