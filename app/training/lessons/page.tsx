import React from 'react';
import {
    Button,
    Card,
    CardContent,
    Stack,
    Typography
} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import LessonTable from "@/components/Lesson/LessonTable";
import RoleOnly from "@/components/Access/RoleOnly";

export default function Page() {

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{mb: 2,}}>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h5">Lessons</Typography>
                    </Stack>
                    <RoleOnly check="isStaff">
                        <Link href="/training/lessons/new">
                            <Button variant="contained" size="large" startIcon={<Add/>}>New Lesson</Button>
                        </Link>
                    </RoleOnly>
                </Stack>
                <LessonTable/>
            </CardContent>
        </Card>
    );
}
