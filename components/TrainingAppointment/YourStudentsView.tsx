'use client';
import React, {useMemo} from 'react';
import {
    Card,
    CardContent,
    Chip,
    CircularProgress,
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
import Link from "next/link";
import {Check, Close, Event, Info, LocalActivity, MilitaryTech, PendingOutlined, People} from "@mui/icons-material";
import {formatTimezoneDate, formatZuluDate, getTimeAgo, getTimeIn} from "@/lib/date";
import TrainingAppointmentFormDialog from "@/components/TrainingAppointment/TrainingAppointmentFormDialog";
import TrainingAppointmentDeleteButton from "@/components/TrainingAppointment/TrainingAppointmentDeleteButton";
import {format} from "date-fns";
import TrainerSideRequestButton from "@/components/TrainerReleaseRequest/TrainerSideRequestButton";
import {
    useOtsRecommendations,
    useTrainingAppointments,
    useTrainingAssignments,
    useTrainingSessions,
} from "@/lib/osmium/hooks/training";
import {useRosterControllers, useUsersByRole} from "@/lib/osmium/hooks/users";

const createCalendarLink = (
    startDate: Date,
    durationMinutes: number,
    timezone: string,
    studentName: string,
    sessionDetails: string
): string => {
    const startDateGMT = new Date(startDate.toLocaleString("en-US", {timeZone: timezone}));
    const endDateGMT = new Date(startDateGMT.getTime() + durationMinutes * 60 * 1000);

    const formatDate = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");

    const start = formatDate(startDateGMT);
    const end = formatDate(endDateGMT);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=Session%20with%20${encodeURIComponent(
        studentName
    )}&details=${encodeURIComponent(sessionDetails)}&dates=${start}/${end}&ctz=${timezone}`;
};

interface StudentRow {
    id: string;
    cid: number;
    name: string;
    rating?: string | null;
    assignmentId?: string;
    lastSession?: {
        id: string;
        start: string;
        tickets: { id: string, lesson_identifier: string, passed: boolean }[],
    };
    nextAppointment?: {
        start: string;
        trainerName: string;
        lessonIdentifiers: string[];
    };
}

export default function YourStudentsView({timeZone, currentUserCid, isInstructor}: {
    timeZone: string,
    currentUserCid: string,
    isInstructor: boolean,
}) {

    const {data: rosterData, isLoading: rosterLoading} = useRosterControllers();
    const {data: instructorsData, isLoading: instructorsLoading} = useUsersByRole('INS');
    const {data: mentorsData, isLoading: mentorsLoading} = useUsersByRole('MTR');
    const {data: assignmentsData, isLoading: assignmentsLoading} = useTrainingAssignments();
    const {data: appointmentsData, isLoading: appointmentsLoading} = useTrainingAppointments({pageSize: 200});
    const {data: otsData, isLoading: otsLoading} = useOtsRecommendations({pageSize: 200});
    const {data: sessionsData, isLoading: sessionsLoading} = useTrainingSessions({
        pageSize: 200,
        sortField: 'start',
        sortOrder: 'desc',
    });

    const myOsmiumId = useMemo(() => {
        const myCid = Number(currentUserCid);
        const pool = [...(rosterData?.items ?? []), ...(instructorsData?.items ?? []), ...(mentorsData?.items ?? [])];
        return pool.find((u) => u.basic.cid === myCid && !!u.full)?.full?.id;
    }, [currentUserCid, rosterData, instructorsData, mentorsData]);

    const rosterByCid = useMemo(() => {
        const map = new Map<number, { rating?: string | null }>();
        for (const item of rosterData?.items ?? []) {
            map.set(item.basic.cid, {rating: item.basic.rating});
        }
        return map;
    }, [rosterData]);

    const now = Date.now();

    const myAppointments = useMemo(() => {
        if (!myOsmiumId) return [];
        return (appointmentsData?.items ?? [])
            .filter((a) => a.trainer_id === myOsmiumId || a.additional_trainers.some((at) => at.trainer_id === myOsmiumId))
            .filter((a) => new Date(a.start).getTime() >= now - 30 * 60 * 1000)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [appointmentsData, myOsmiumId, now]);

    const otsAssignments = useMemo(() => {
        if (!myOsmiumId) return [];
        return (otsData?.items ?? []).filter((o) => o.assigned_instructor_id === myOsmiumId);
    }, [otsData, myOsmiumId]);

    const buildStudentRows = (studentIds: string[]): StudentRow[] => {
        return studentIds.map((studentId) => {
            const assignment = (assignmentsData?.items ?? []).find((a) => a.student_id === studentId);
            const lastSession = (sessionsData?.items ?? []).find((s) => s.student_id === studentId);
            const nextAppointment = (appointmentsData?.items ?? [])
                .filter((a) => a.student_id === studentId && new Date(a.start).getTime() >= now)
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

            return {
                id: studentId,
                cid: assignment?.student_cid ?? 0,
                name: assignment?.student_name ?? 'Unknown',
                rating: rosterByCid.get(assignment?.student_cid ?? -1)?.rating,
                assignmentId: assignment?.id,
                lastSession: lastSession ? {
                    id: lastSession.id,
                    start: lastSession.start,
                    tickets: lastSession.tickets,
                } : undefined,
                nextAppointment: nextAppointment ? {
                    start: nextAppointment.start,
                    trainerName: nextAppointment.trainer_name,
                    lessonIdentifiers: nextAppointment.lessons.map((l) => l.identifier),
                } : undefined,
            };
        });
    }

    const primaryStudentIds = useMemo(() => {
        if (!myOsmiumId) return [];
        return (assignmentsData?.items ?? [])
            .filter((a) => a.primary_trainer_id === myOsmiumId)
            .map((a) => a.student_id);
    }, [assignmentsData, myOsmiumId]);

    const otherStudentIds = useMemo(() => {
        if (!myOsmiumId) return [];
        return (assignmentsData?.items ?? [])
            .filter((a) => a.other_trainer_ids.includes(myOsmiumId))
            .map((a) => a.student_id);
    }, [assignmentsData, myOsmiumId]);

    const primaryStudents = buildStudentRows(primaryStudentIds);
    const otherStudents = buildStudentRows(otherStudentIds);

    const allLoading = rosterLoading || instructorsLoading || mentorsLoading || assignmentsLoading
        || appointmentsLoading || otsLoading || sessionsLoading;

    if (allLoading) {
        return <CircularProgress/>;
    }

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{mb: 1,}}>
                        <Typography variant="h5">Your Upcoming Sessions</Typography>
                        <TrainingAppointmentFormDialog timeZone={timeZone} currentUserCid={currentUserCid}/>
                    </Stack>
                    {myAppointments.length === 0 &&
                        <Typography>You have no upcoming training appointments.</Typography>}
                    {myAppointments.length > 0 && <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Mins</TableCell>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Trainer(s)</TableCell>
                                    <TableCell>Prep</TableCell>
                                    <TableCell>Box</TableCell>
                                    <TableCell>Lesson(s)</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myAppointments.map((ta) => (
                                    <TableRow key={ta.id}>
                                        <TableCell>{formatTimezoneDate(new Date(ta.start), timeZone)}</TableCell>
                                        <TableCell>{ta.lessons.map((l) => l.duration).reduce((p, c) => p + c, 0)}</TableCell>
                                        <TableCell>{`${ta.student_name} - ${rosterByCid.get(ta.student_cid)?.rating ?? ''}`}</TableCell>
                                        <TableCell>
                                            <Tooltip
                                                title={[{
                                                    trainer_name: ta.trainer_name,
                                                    description: null as string | null,
                                                }, ...ta.additional_trainers,].map((at) => `${at.trainer_name} ${at.description ? `(${at.description})` : ''}`).join(', ')}>
                                                <span>{ta.trainer_name}{ta.additional_trainers.length > 0 ? `, ${ta.additional_trainers.map((at) => at.trainer_name).join(', ')}` : ''}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{ta.preparation_completed ? <Check color="success"/> :
                                            <Close color="error"/>}</TableCell>
                                        <TableCell>{ta.double_booking ?
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
                                            <Tooltip title={ta.notes || ''} arrow>
                                                <Typography variant="caption">
                                                    {ta.notes.length > 20 ? `${ta.notes.substring(0, 20)}...` : ta.notes || ''}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={createCalendarLink(
                                                    new Date(ta.start),
                                                    ta.lessons.map((l) => l.duration).reduce((p, c) => p + c, 0),
                                                    timeZone,
                                                    ta.student_name || '',
                                                    `Session with ${ta.student_name} covering lessons: ${ta.lessons.map((l) => l.identifier).join(', ')}`
                                                )}
                                            >
                                                <Tooltip title="Add to Google Calendar">
                                                    <IconButton>
                                                        <Event/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Link>
                                            {ta.trainer_id === myOsmiumId &&
                                                <TrainingAppointmentFormDialog timeZone={timeZone}
                                                                              currentUserCid={currentUserCid}
                                                                              appointment={ta}/>}
                                            {ta.trainer_id === myOsmiumId &&
                                                <TrainingAppointmentDeleteButton trainingAppointment={ta}/>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
                </CardContent>
            </Card>
            {isInstructor && <Card sx={{border: otsAssignments.length > 0 ? 2 : 0, borderColor: 'red',}}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>OTS Assignments</Typography>
                    {otsAssignments.length === 0 && <Typography>You have no OTS assignments.</Typography>}
                    {otsAssignments.length > 0 &&
                        <Typography sx={{mb: 2,}}>You have been assigned the following VATUSA OTS evaluations. Please
                            reach out to the
                            student(s) to schedule the session and make an appointment. The assignment will
                            automatically get deleted when an OTS lesson ticket is submitted.</Typography>}
                    {otsAssignments.length > 0 && <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Submitted</TableCell>
                                    <TableCell>Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {otsAssignments.map((ots) => (
                                    <TableRow key={ots.id}>
                                        <TableCell>{ots.student_name}</TableCell>
                                        <TableCell>{formatZuluDate(new Date(ots.created_at))}</TableCell>
                                        <TableCell>{ots.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
                </CardContent>
            </Card>}
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Primary Students</Typography>
                    {primaryStudents.length === 0 && <Typography>You have no primary students.</Typography>}
                    {primaryStudents.length > 0 && getTable(primaryStudents, timeZone)}
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Other Students</Typography>
                    {otherStudents.length === 0 && <Typography>You have no other students.</Typography>}
                    {otherStudents.length > 0 && getTable(otherStudents, timeZone)}
                </CardContent>
            </Card>
        </Stack>

    );
}

const getTable = (students: StudentRow[], timezone: string) => (
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
                {students.map(student => (<TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.rating}</TableCell>
                    <TableCell>
                        {student.lastSession ? (
                            <Tooltip title={formatZuluDate(new Date(student.lastSession.start))}>
                                <Chip
                                    label={getTimeAgo(new Date(student.lastSession.start))}
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
                              key={ticket.id}
                              label={ticket.lesson_identifier}
                              color={ticket.passed ? 'success' : 'error'}
                              sx={{mr: 1,}}
                        />) : 'N/A'}
                    </TableCell>
                    <TableCell>
                        {student.nextAppointment ? (
                            <Tooltip
                                title={`${formatTimezoneDate(new Date(student.nextAppointment.start), timezone)} with ${student.nextAppointment.trainerName}: ${student.nextAppointment.lessonIdentifiers.join(', ')}`}>
                                <Link
                                    href={`/training/appointments?sortField=start&sortDirection=asc&filterField=student&filterValue=${student.cid}&filterOperator=equals`}>
                                    <Chip
                                        label={getTimeIn(new Date(student.nextAppointment.start))}
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
                            <Link href={`/training/controller/${student.cid}`} target="_blank">
                                <IconButton>
                                    <MilitaryTech/>
                                </IconButton>
                            </Link>
                        </Tooltip>
                        <Tooltip title="View Training Assignment">
                            <Link href={`/training/assignments/${student.assignmentId}`} target="_blank">
                                <IconButton>
                                    <People/>
                                </IconButton>
                            </Link>
                        </Tooltip>
                        <TrainerSideRequestButton studentId={student.id}/>
                    </TableCell>
                </TableRow>))}
            </TableBody>
        </Table>
    </TableContainer>
);
