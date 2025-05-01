import React from 'react';
import {
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {getRating} from "@/lib/vatsim";
import Link from "next/link";
import {Check, Close, LocalActivity, MilitaryTech, People} from "@mui/icons-material";
import {Lesson} from "@prisma/client";
import {formatZuluDate, getTimeAgo} from "@/lib/date";
import TrainingAppointmentFormDialog from "@/components/TrainingAppointment/TrainingAppointmentFormDialog";
import TrainingAppointmentDeleteButton from "@/components/TrainingAppointment/TrainingAppointmentDeleteButton";

export type Student = {
    user: User,
    trainingAssignmentId?: string,
    lastSession: {
        start: Date,
        id: string,
        tickets: {
            lesson: Lesson,
            passed: boolean,
        }[],
    } | undefined,
}

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error('User not authenticated');
    }

    const allUsers = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: 'NONE',
            },
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            cid: true,
        }
    });

    const allLessons = await prisma.lesson.findMany({
        select: {
            id: true,
            identifier: true,
            name: true,
            duration: true,
        },
    });

    const primaryStudentsData = await prisma.user.findMany({
        where: {
            trainingAssignmentStudent: {
                primaryTrainerId: session.user.id,
            },
        },
        include: {
            trainingAssignmentStudent: true,
            trainingSessions: {
                orderBy: {start: 'desc'},
                take: 1,
                include: {
                    tickets: {
                        include: {
                            lesson: true,
                        },
                    },
                },
            },
        },
    });

    const otherStudentsData = await prisma.user.findMany({
        where: {
            trainingAssignmentStudent: {
                otherTrainers: {
                    some: {
                        id: session.user.id,
                    },
                },
            },
        },
        include: {
            trainingAssignmentStudent: true,
            trainingSessions: {
                orderBy: {start: 'desc'},
                take: 1,
                include: {
                    tickets: {
                        include: {
                            lesson: true,
                        },
                    },
                },
            },
        },
    });

    const primaryStudents: Student[] = primaryStudentsData.map(student => ({
        user: student as User,
        trainingAssignmentId: student.trainingAssignmentStudent?.id,
        lastSession: student.trainingSessions[0] ? {
            start: student.trainingSessions[0].start,
            id: student.trainingSessions[0].id,
            tickets: student.trainingSessions[0].tickets.map(ticket => ({
                lesson: ticket.lesson,
                passed: ticket.passed,
            })),
        } : undefined,
    }));

    const otherStudents: Student[] = otherStudentsData.map(student => ({
        user: student as User,
        trainingAssignmentId: student.trainingAssignmentStudent?.id,
        lastSession: student.trainingSessions[0] ? {
            start: student.trainingSessions[0].start,
            id: student.trainingSessions[0].id,
            tickets: student.trainingSessions[0].tickets.map(ticket => ({
                lesson: ticket.lesson,
                passed: ticket.passed,
            })),
        } : undefined,
    }));

    const trainingAppointments = await prisma.trainingAppointment.findMany({
        where: {
            trainerId: session.user.id,
        },
        include: {
            student: true,
            lessons: true,
        },
        orderBy: {
            start: 'asc',
        }
    });

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{mb: 1,}}>
                        <Typography variant="h5">Your Upcoming Sessions</Typography>
                        <TrainingAppointmentFormDialog assignedStudents={[...primaryStudents, ...otherStudents]}
                                                       allStudents={allUsers as User[]}
                                                       allLessons={allLessons as Lesson[]}/>
                    </Stack>
                    {trainingAppointments.length === 0 &&
                        <Typography>You have no upcoming training appointments.</Typography>}
                    {trainingAppointments.length > 0 &&
                        <Typography sx={{mb: 2,}}>Appointments are automatically deleted 15 minutes after the start
                            time.</Typography>}
                    {trainingAppointments.length > 0 && <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Start (Zulu)</TableCell>
                                    <TableCell>Duration (min)</TableCell>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Preparation Completed</TableCell>
                                    <TableCell>Lesson(s)</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {trainingAppointments.map((ta) => (
                                    <TableRow key={ta.id}>
                                        <TableCell>{formatZuluDate(ta.start)}</TableCell>
                                        <TableCell>{ta.lessons.map((l) => l.duration).reduce((p, c, i) => {
                                            return i == 0 ? c : p + c;
                                        })}</TableCell>
                                        <TableCell>{`${ta.student.fullName} - ${getRating(ta.student.rating)}`}</TableCell>
                                        <TableCell>{ta.preparationCompleted ? <Check color="success"/> :
                                            <Close color="error"/>}</TableCell>
                                        <TableCell>{ta.lessons.map((l) => (
                                            <Chip size="small"
                                                  key={l.id}
                                                  label={l.identifier}
                                                  color="info"
                                                  sx={{margin: '2px'}}
                                            />
                                        ))}</TableCell>
                                        <TableCell>
                                            <TrainingAppointmentFormDialog trainingAppointment={{
                                                id: ta.id,
                                                studentId: ta.studentId,
                                                start: ta.start,
                                                lessonIds: ta.lessons.map(l => l.id),
                                            }} assignedStudents={[...primaryStudents, ...otherStudents]}
                                                                           allStudents={allUsers as User[]}
                                                                           allLessons={allLessons as Lesson[]}/>
                                            <TrainingAppointmentDeleteButton trainingAppointment={ta}/>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Primary Students</Typography>
                    {primaryStudents.length === 0 && <Typography>You have no primary students.</Typography>}
                    {primaryStudents.length > 0 && getTable(primaryStudents)}
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Other Students</Typography>
                    {otherStudents.length === 0 && <Typography>You have no other students.</Typography>}
                    {otherStudents.length > 0 && getTable(otherStudents)}
                </CardContent>
            </Card>
        </Stack>

    );
}

const getTable = (students: Student[]) => (
    <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Last Session Date</TableCell>
                    <TableCell>Last Session Lesson(s)</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {students.map(student => (<TableRow key={student.user.id}>
                    <TableCell>{student.user.fullName}</TableCell>
                    <TableCell>{getRating(student.user.rating)}</TableCell>
                    <TableCell>
                        {student.lastSession ? (
                            <Tooltip title={formatZuluDate(student.lastSession.start)}>
                                <Chip
                                    label={getTimeAgo(student.lastSession.start)}
                                    size="small"
                                    color={(() => {
                                        const lastSessionDate = new Date(student.lastSession.start);
                                        const now = new Date();
                                        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
                                        const twoWeeksInMs = 2 * oneWeekInMs;

                                        if ((now.getTime() - lastSessionDate.getTime()) > twoWeeksInMs) {
                                            return 'error';
                                        } else if ((now.getTime() - lastSessionDate.getTime()) > oneWeekInMs) {
                                            return 'warning';
                                        } else {
                                            return 'success';
                                        }
                                    })()}
                                />
                            </Tooltip>
                        ) : 'N/A'}
                    </TableCell>
                    <TableCell>{student.lastSession ? student.lastSession.tickets.map((ticket) =>
                        <Chip size="small"
                              key={ticket.lesson.id}
                              label={ticket.lesson.identifier}
                              color={ticket.passed ? 'success' : 'error'}
                              sx={{mr: 1,}}
                        />) : 'N/A'}
                    </TableCell>
                    <TableCell>
                        {student.lastSession ? (
                            <Tooltip title="View Last Training Session">
                                <Link href={`/training/sessions/${student.lastSession.id}`} target="_blank">
                                    <IconButton>
                                        <LocalActivity/>
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        ) : null}
                        <Tooltip title="View Certifications">
                            <Link href={`/training/controller/${student.user.cid}`} target="_blank">
                                <IconButton>
                                    <MilitaryTech/>
                                </IconButton>
                            </Link>
                        </Tooltip>
                        <Tooltip title="View Training Assignment">
                            <Link href={`/training/assignments/${student.trainingAssignmentId}`} target="_blank">
                                <IconButton>
                                    <People/>
                                </IconButton>
                            </Link>
                        </Tooltip>
                    </TableCell>
                </TableRow>))}
            </TableBody>
        </Table>
    </TableContainer>
);