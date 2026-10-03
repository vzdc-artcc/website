import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import LessonTable from "@/components/Lesson/LessonTable";

export default async function Page() {

    const session = await getServerSession(authOptions);

    return session?.user && (
        <Card>
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        justifyContent: "space-between",
                        mb: 2
                    }}>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h5">Lessons</Typography>
                    </Stack>
                    {session?.user.roles.includes("STAFF") && <Link href="/training/lessons/new">
                        <Button variant="contained" size="large" startIcon={<Add/>}>New Lesson</Button>
                    </Link>}
                </Stack>
                <LessonTable user={session.user}/>
            </CardContent>
        </Card>
    );
}