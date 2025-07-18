import React from 'react';
import {Card, CardContent, Container, Typography} from "@mui/material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import ErrorCard from "@/components/Error/ErrorCard";
import SuaRequestForm from "@/components/SuaRequest/SuaRequestForm";

const allSuas = (process.env['SUAS'] as string).split(',');

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return <ErrorCard heading="Special Use Airspace Request" message="You must be logged in to view this page."/>
    }

    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>Special Use Airspace Request</Typography>
                    <SuaRequestForm user={session.user} allSuas={allSuas.sort((a, b) => a.localeCompare(b))}/>
                </CardContent>
            </Card>
        </Container>
    );
}