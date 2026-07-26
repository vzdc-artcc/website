'use client';
import React from 'react';
import {Button, Card, CardContent, CircularProgress, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {KeyboardArrowRight} from "@mui/icons-material";
import TrainingSessionStudentTable from "@/components/TrainingSession/TrainingSessionStudentTable";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import {useTrainingSessions} from "@/lib/osmium/hooks/training";

export default function TrainingCard({cid}: { cid: number, }) {

    const {data: resolvedUser, isLoading: userLoading} = useUserByCid(cid || undefined);
    const studentId = resolvedUser?.full?.profile.id;
    const {data: sessionsData, isLoading: sessionsLoading} = useTrainingSessions({studentId, pageSize: 1});
    const numSessions = sessionsData?.total ?? 0;

    if (userLoading || sessionsLoading) {
        return <CircularProgress/>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Training Tickets</Typography>
                {numSessions === 0 && <Typography sx={{mt: 1,}}>You do not have any training sessions.</Typography>}
                {numSessions > 0 && <Typography sx={{my: 1,}}>All times in GMT</Typography>}
                {numSessions > 0 && <TrainingSessionStudentTable cid={cid} timezone={resolvedUser?.full?.profile.timezone ?? 'UTC'} take={5}/>}
                {numSessions > 5 && <Stack direction="row" justifyContent="flex-end" sx={{mt: 1,}}>
                    <Link href="/profile/training" style={{color: 'inherit', textDecoration: 'none',}}>
                        <Button color="inherit" endIcon={<KeyboardArrowRight/>}>View all Training</Button>
                    </Link>
                </Stack>}
            </CardContent>
        </Card>
    )

}
