import React from 'react';
import {
    Button,
    Card,
    CardContent,
    Chip,
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
import {getRating} from "@/lib/vatsim";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import InstructorDropdown from "@/components/OtsRecommendation/InstructorDropdown";
import OtsRecommendationDeleteButton from "@/components/OtsRecommendation/OtsRecommendationDeleteButton";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import {formatZuluDate, getTimeIn} from "@/lib/date";

export default async function Page() {

    const otsRecommendations = await prisma.otsRecommendation.findMany({
        orderBy: {
            createdAt: 'asc',
        },
        include: {
            student: true,
            assignedInstructor: true,
        },
    });

    const allInstructors = await prisma.user.findMany({
        where: {
            roles: {has: "INSTRUCTOR"},
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const session = await getServerSession(authOptions);
    const canModify = session?.user && (session.user.staffPositions.includes('TA') || session.user.staffPositions.includes('WM'));

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{mb: 2,}}>
                    <Typography variant="h5">OTS Recommendations</Typography>
                    {canModify && <Link href="/training/ots/new">
                        <Button variant="contained" size="large" startIcon={<Add/>}>New OTS Recommendation</Button>
                    </Link>}
                </Stack>
                {otsRecommendations.length === 0 && <Typography>No OTS recommendations found.</Typography>}
                {otsRecommendations.length > 0 &&
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell>Instructor</TableCell>
                                    <TableCell>Appointment</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {otsRecommendations.map(rec => (
                                    <TableRow key={rec.id}>
                                        <TableCell>{rec.student.fullName} ({rec.student.cid})</TableCell>
                                        <TableCell>{getRating(rec.student.rating)}</TableCell>
                                        {canModify && <TableCell>
                                            <InstructorDropdown rec={rec} allInstructors={allInstructors as User[]}
                                                                assignedInstructorId={rec.assignedInstructorId}/>
                                        </TableCell>}
                                        {!canModify && <TableCell>
                                            {rec.assignedInstructor ? rec.assignedInstructor.fullName : 'Unassigned'}
                                        </TableCell>}
                                        <TableCell>{getLatestAppointment(rec.student.id, rec.assignedInstructorId || undefined)}</TableCell>
                                        <TableCell>{rec.notes}</TableCell>
                                        <TableCell>
                                            {canModify && <OtsRecommendationDeleteButton rec={rec}/>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
            </CardContent>
        </Card>
    );
}

const getLatestAppointment = async (userId: string, instructorId?: string) => {
    const appointment = await prisma.trainingAppointment.findFirst({
        where: {
            studentId: userId,
            trainerId: instructorId,
            start: {
                gte: new Date(),
            },
            lessons: {
                some: {
                    instructorOnly: true,
                },
            },
        },
        orderBy: {
            start: 'asc',
        },
        include: {
            lessons: true,
        },
    });

    if (!instructorId) {
        return <>-</>;
    }

    if (appointment) {
        return <Tooltip title={`${getTimeIn(appointment.start)} - ${formatZuluDate(appointment.start)}`}>
            <>
                {appointment.lessons.filter((l) => l.instructorOnly).map((lesson) => (
                    <Chip
                        key={`${appointment.id}-${lesson.id}`}
                        label={lesson.identifier}
                        size="small"
                        color="info"
                    />
                ))}
            </>
        </Tooltip>
    }

    return <>NO APPT</>;
}