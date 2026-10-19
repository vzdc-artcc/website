import React from 'react';
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";
import LessonForm from "@/components/Lesson/LessonForm";

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes("STAFF")) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">You must be staff to access this page.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        alignItems: "center",
                        mb: 1
                    }}>
                    <Link href="/training/lessons" style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5">New Lesson</Typography>
                </Stack>
                <LessonForm/>
            </CardContent>
        </Card>
    );
}