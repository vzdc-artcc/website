'use client';
import React from 'react';
import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {formatTimezoneDate, getDuration} from "@/lib/date";
import Link from "next/link";
import {Visibility} from "@mui/icons-material";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import {useTrainingSessions} from "@/lib/osmium/hooks/training";

export default function TrainingSessionStudentTable({cid, timezone, take}: { cid: number, timezone: string, take?: number }) {
    const {data: resolvedUser, isLoading: userLoading} = useUserByCid(cid || undefined);
    const studentId = resolvedUser?.full?.profile.id;

    const {data: sessionsData, isLoading: sessionsLoading} = useTrainingSessions({
        studentId,
        pageSize: take,
        sortField: 'start',
        sortOrder: 'desc',
    });

    if (userLoading || sessionsLoading) {
        return <CircularProgress/>;
    }

    const sessions = sessionsData?.items ?? [];

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Trainer</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>End</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Lessons</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sessions.map((trainingSession) => (
                        <TableRow key={trainingSession.id}>
                            <TableCell>{trainingSession.instructor_name}</TableCell>
                            <TableCell>{formatTimezoneDate(new Date(trainingSession.start), timezone)}</TableCell>
                            <TableCell>{formatTimezoneDate(new Date(trainingSession.end), timezone)}</TableCell>
                            <TableCell>{getDuration(new Date(trainingSession.start), new Date(trainingSession.end))}</TableCell>
                            <TableCell>
                                <Stack direction="column" spacing={1}>
                                    {trainingSession.tickets.map((tt) => (
                                        <Box key={tt.id}>
                                            <Chip size="small" label={tt.lesson_identifier}
                                                  color={tt.passed ? 'success' : 'error'}/>
                                        </Box>
                                    ))}
                                </Stack>
                            </TableCell>
                            <TableCell>
                                <Link href={`/profile/training/${trainingSession.id}`} passHref>
                                    <IconButton size="small">
                                        <Visibility/>
                                    </IconButton>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
