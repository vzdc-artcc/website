import React from 'react';
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";
import LessonForm from "@/components/Lesson/LessonForm";
import RequireRole from "@/components/Access/RequireRole";

export default function Page() {

    return (
        <RequireRole check="isStaff">
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 1,}}>
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
        </RequireRole>
    );
}
