import React from 'react';
import {User} from "next-auth";
import prisma from "@/lib/db";
import {
    Box,
    Chip,
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

export default async function TrainingSessionStudentTable({user, take}: { user: User, take?: number }) {
    const trainingSessions = await prisma.trainingSession.findMany({
        where: {
            student: {
                id: user.id,
            },
        },
        include: {
            student: true,
            instructor: true,
            tickets: {
                include: {
                    lesson: true,
                    mistakes: true,
                }
            },
        },
        orderBy: {
            start: 'desc',
        },
        take,
    });

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
                        <TableCell>Mistakes</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {trainingSessions.map((trainingSession) => (
                        <TableRow key={trainingSession.id}>
                            <TableCell>{trainingSession.student.firstName} {trainingSession.student.lastName} ({trainingSession.student.cid})</TableCell>
                            <TableCell>{formatTimezoneDate(trainingSession.start, user.timezone)}</TableCell>
                            <TableCell>{formatTimezoneDate(trainingSession.end, user.timezone)}</TableCell>
                            <TableCell>{getDuration(trainingSession.start, trainingSession.end)}</TableCell>
                            <TableCell>
                                <Stack direction="column" spacing={1}>
                                    {trainingSession.tickets.map((tt) => (
                                        <Box key={tt.id}>
                                            <Chip size="small" label={tt.lesson.identifier}
                                                  color={tt.passed ? 'success' : 'error'}/>
                                        </Box>
                                    ))}
                                </Stack>
                            </TableCell>
                            <TableCell>{trainingSession.tickets.reduce((acc, ticket) => acc + ticket.mistakes.length, 0)}</TableCell>
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