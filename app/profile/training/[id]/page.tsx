'use client';
import React, {use} from 'react';
import {Card, CardContent} from "@mui/material";
import TrainingSessionInformation from "@/components/TrainingSession/TrainingSessionInformation";
import RequireAuth from "@/components/Access/RequireAuth";

export default function Page(props: { params: Promise<{ id: string }> }) {
    const {id} = use(props.params);

    // Access control is enforced by osmium: GET /training/sessions/{id} is
    // readable by the session's own student (auth.profile.read) or staff
    // (training.sessions.read); a non-owner non-staff caller gets a 403, which
    // TrainingSessionInformation surfaces as not-found.
    return (
        <RequireAuth>
            <Card>
                <CardContent>
                    <TrainingSessionInformation id={id}/>
                </CardContent>
            </Card>
        </RequireAuth>
    );
}
