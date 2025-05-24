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
import {Check, Close, Event, Info, LocalActivity, MilitaryTech, PendingOutlined, People} from "@mui/icons-material";
import {Lesson} from "@prisma/client";
import {formatEasternDate, formatTimezoneDate, formatZuluDate, getTimeAgo, getTimeIn} from "@/lib/date";
import TrainingAppointmentFormDialog from "@/components/TrainingAppointment/TrainingAppointmentFormDialog";
import TrainingAppointmentDeleteButton from "@/components/TrainingAppointment/TrainingAppointmentDeleteButton";
import {format} from "date-fns";
import TrainerSideRequestButton from "@/components/TrainerReleaseRequest/TrainerSideRequestButton";

const createCalendarLink = (
    startDate: Date,
    durationMinutes: number,
    timezone: string,
    studentName: string,
    sessionDetails: string
): string => {
    // Convert startDate to GMT
    const startDateGMT = new Date(startDate.toLocaleString("en-US", {timeZone: timezone}));
    const endDateGMT = new Date(startDateGMT.getTime() + durationMinutes * 60 * 1000);

    // Format dates in Google Calendar format
    const formatDate = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");

    const start = formatDate(startDateGMT);
    const end = formatDate(endDateGMT);

    // Generate the calendar link
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=Session%20with%20${encodeURIComponent(
        studentName
    )}&details=${encodeURIComponent(sessionDetails)}&dates=${start}/${end}&ctz=${timezone}`;
};

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
    trainingAppointmentStudent: {
        start: Date,
        trainer: {
            fullName: string | null,
        },
        lessons: {
            id: string,
            identifier: string,
        }[],
    }[],
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
        orderBy: {
            identifier: 'asc',
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
            trainingAppointmentStudent: {
                orderBy: {
                    start: 'asc',
                },
                where: {
                    start: {
                        gte: new Date(),
                    }
                },
                include: {
                    trainer: {
                        select: {
                            fullName: true,
                        },
                    },
                    lessons: {
                        select: {
                            id: true,
                            identifier: true,
                        }
                    },
                },
                take: 1,
            },
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
            trainingAppointmentStudent: {
                orderBy: {
                    start: 'asc',
                },
                where: {
                    start: {
                        gte: new Date(),
                    }
                },
                include: {
                    trainer: {
                        select: {
                            fullName: true,
                        },
                    },
                    lessons: {
                        select: {
                            id: true,
                            identifier: true,
                        }
                    },
                },
            },
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
        trainingAppointmentStudent: student.trainingAppointmentStudent,
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
        trainingAppointmentStudent: student.trainingAppointmentStudent,
    }));

    const nowMinus30Minutes = new Date(Date.now() - 30 * 60 * 1000);

    const trainingAppointments = await prisma.trainingAppointment.findMany({
        where: {
            trainerId: session.user.id,
            start: {
                gte: nowMinus30Minutes,
            },
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
                        <TrainingAppointmentFormDialog timeZone={session.user.timezone}
                                                       assignedStudents={[...primaryStudents, ...otherStudents]}
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
                                    <TableCell>Start</TableCell>
                                    <TableCell>Duration (min)</TableCell>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Preparation Completed</TableCell>
                                    <TableCell>Environment</TableCell>
                                    <TableCell>Lesson(s)</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {trainingAppointments.map((ta) => (
                                    <TableRow key={ta.id}>
                                        <TableCell>{formatTimezoneDate(ta.start, session.user.timezone)}</TableCell>
                                        <TableCell>{ta.lessons.map((l) => l.duration).reduce((p, c) => {
                                            return p + c;
                                        }, 0)}</TableCell>
                                        <TableCell>{`${ta.student.fullName} - ${getRating(ta.student.rating)}`}</TableCell>
                                        <TableCell>{ta.preparationCompleted ? <Check color="success"/> :
                                            <Close color="error"/>}</TableCell>
                                        <TableCell>{ta.doubleBooking ?
                                            <Tooltip
                                                title="Double Booking.  Check calendar for specifics and consider rescheduling.">
                                                <Info color="error"/>
                                            </Tooltip>
                                            : ta.environment ||
                                            <PendingOutlined color="warning"/>}
                                        </TableCell>
                                        <TableCell>{ta.lessons.map((l) => (
                                            <Chip size="small"
                                                  key={l.id}
                                                  label={l.identifier}
                                                  color="info"
                                                  sx={{margin: '2px'}}
                                            />
                                        ))}</TableCell>
                                        <TableCell>
                                            <Link
                                                href={createCalendarLink(
                                                    ta.start,
                                                    ta.lessons.map((l) => l.duration).reduce((p, c) => p + c, 0),
                                                    session.user.timezone,
                                                    ta.student.fullName || '',
                                                    `Session with ${ta.student.fullName} covering lessons: ${ta.lessons.map((l) => l.identifier).join(', ')}`
                                                )}
                                            >
                                                <Tooltip title="Add to Calendar">
                                                    <IconButton>
                                                        <Event/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Link>
                                            <TrainingAppointmentFormDialog timeZone={session.user.timezone}
                                                                           trainingAppointment={{
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
                    <TableCell>Future Session</TableCell>
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
                        {student.trainingAppointmentStudent.length > 0 ? (
                            <Tooltip
                                title={`${formatEasternDate(student.trainingAppointmentStudent[0].start)} with ${student.trainingAppointmentStudent[0].trainer.fullName}: ${student.trainingAppointmentStudent[0].lessons.map((l) => l.identifier).join(', ')}`}>
                                <Link
                                    href={`/training/appointments?sortField=start&sortDirection=asc&filterField=student&filterValue=${student.user.cid}&filterOperator=equals`}>
                                    <Chip
                                        label={getTimeIn(student.trainingAppointmentStudent[0].start)}
                                        size="small"
                                        color="info"
                                    />
                                </Link>
                            </Tooltip>
                        ) : ''}
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
                        <TrainerSideRequestButton student={student.user}/>
                    </TableCell>
                </TableRow>))}
            </TableBody>
        </Table>
    </TableContainer>
);