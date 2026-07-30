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
import {useMe} from "@/lib/osmium/hooks/me";

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
    trainingAssignmentId?: string;
}

export default function YourStudentsView() {

    // Identity now comes from osmium's /me (Phase 6) instead of the NextAuth
    // session passed as props. The current user's osmium id is returned
    // directly, so no roster-search is needed to resolve it. isInstructor
    // preserves the legacy pure-INSTRUCTOR semantics (not STAFF-folded).
    const {data: me} = useMe();
    const timeZone = me?.profile.timezone ?? 'America/New_York';
    const currentUserCid = me ? String(me.cid) : '';
    const isInstructor = me?.role_names.includes("INS") ?? false;
    const myId = me?.id;

    const {data: rosterData, isLoading: rosterLoading} = useRosterControllers();
    const {data: instructorsData, isLoading: instructorsLoading} = useUsersByRole('INS');
    const {data: mentorsData, isLoading: mentorsLoading} = useUsersByRole('MTR');
    const {data: assignmentsData, isLoading: assignmentsLoading} = useTrainingAssignments();
    const {data: appointmentsData, isLoading: appointmentsLoading} = useTrainingAppointments({sortField: 'start', sortOrder: 'asc'});
    const {data: sessionsData, isLoading: sessionsLoading} = useTrainingSessions({sortField: 'start', sortOrder: 'desc'});
    const {data: otsData, isLoading: otsLoading} = useOtsRecommendations();

    const allLoading = rosterLoading || instructorsLoading || mentorsLoading || assignmentsLoading
        || appointmentsLoading || sessionsLoading || otsLoading || !myId;

    const primaryAssignments = useMemo(() => {
        if (!myId) return [];
        return (assignmentsData?.items ?? []).filter((a) => a.primary_trainer_id === myId);
    }, [assignmentsData, myId]);

    const otherAssignments = useMemo(() => {
        if (!myId) return [];
        return (assignmentsData?.items ?? []).filter((a) => a.other_trainer_ids.includes(myId));
    }, [assignmentsData, myId]);

    const allAppointments = appointmentsData?.items ?? [];

    const myUpcomingAppointments = useMemo(() => {
        if (!myId) return [];
        const cutoff = Date.now() - 30 * 60 * 1000;
        return allAppointments
            .filter((ta) => new Date(ta.start).getTime() >= cutoff)
            .filter((ta) => ta.trainer_id === myId || ta.additional_trainers.some((at) => at.trainer_id === myId))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [allAppointments, myId]);

    const nextAppointmentByStudent = useMemo(() => {
        const map = new Map<string, typeof allAppointments[number]>();
        const now = Date.now();
        for (const ta of allAppointments) {
            if (new Date(ta.start).getTime() < now) continue;
            const existing = map.get(ta.student_id);
            if (!existing || new Date(ta.start).getTime() < new Date(existing.start).getTime()) {
                map.set(ta.student_id, ta);
            }
        }
        return map;
    }, [allAppointments]);

    const lastSessionByStudent = useMemo(() => {
        const map = new Map<string, typeof allSessions[number]>();
        const allSessions = sessionsData?.items ?? [];
        for (const s of allSessions) {
            if (!map.has(s.student_id)) {
                map.set(s.student_id, s);
            }
        }
        return map;
    }, [sessionsData]);

    const otsAssignments = useMemo(() => {
        if (!myId) return [];
        return (otsData?.items ?? []).filter((o) => o.assigned_instructor_id === myId);
    }, [otsData, myId]);

    const buildStudentRow = (assignmentId: string, studentId: string, studentCid: number, studentName: string): StudentRow => {
        const roster = (rosterData?.items ?? []).find((u) => u.full?.id === studentId);
        return {
            id: studentId,
            cid: studentCid,
            name: studentName,
            rating: roster?.basic.rating,
            trainingAssignmentId: assignmentId,
        };
    };

    const primaryStudents: StudentRow[] = primaryAssignments.map((a) => buildStudentRow(a.id, a.student_id, a.student_cid, a.student_name));
    const otherStudents: StudentRow[] = otherAssignments.map((a) => buildStudentRow(a.id, a.student_id, a.student_cid, a.student_name));

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
                    {myUpcomingAppointments.length === 0 &&
                        <Typography>You have no upcoming training appointments.</Typography>}
                    {myUpcomingAppointments.length > 0 && <TableContainer>
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
                                {myUpcomingAppointments.map((ta) => {
                                    const totalMinutes = ta.lessons.map((l) => l.duration).reduce((p, c) => p + c, 0);
                                    const trainers = [{trainer_name: ta.trainer_name, description: null as string | null}, ...ta.additional_trainers.map((at) => ({
                                        trainer_name: at.trainer_name,
                                        description: at.description,
                                    }))];
                                    return (
                                        <TableRow key={ta.id}>
                                            <TableCell>{formatTimezoneDate(new Date(ta.start), timeZone)}</TableCell>
                                            <TableCell>{totalMinutes}</TableCell>
                                            <TableCell>{`${ta.student_name} - ${ta.student_cid}`}</TableCell>
                                            <TableCell>
                                                <Tooltip title={trainers.map((t) => `${t.trainer_name} ${t.description ? `(${t.description})` : ''}`).join(', ')}>
                                                    <span>{trainers.map((t) => t.trainer_name).join(', ')}</span>
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
                                                        totalMinutes,
                                                        timeZone,
                                                        ta.student_name,
                                                        `Session with ${ta.student_name} covering lessons: ${ta.lessons.map((l) => l.identifier).join(', ')}`
                                                    )}
                                                >
                                                    <Tooltip title="Add to Google Calendar">
                                                        <IconButton>
                                                            <Event/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Link>
                                                {ta.trainer_id === myId &&
                                                    <TrainingAppointmentFormDialog timeZone={timeZone}
                                                                                  currentUserCid={currentUserCid}
                                                                                  appointment={ta}/>}
                                                {ta.trainer_id === myId &&
                                                    <TrainingAppointmentDeleteButton trainingAppointment={ta}/>}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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
                    {primaryStudents.length > 0 && getTable(primaryStudents, timeZone, lastSessionByStudent, nextAppointmentByStudent)}
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Other Students</Typography>
                    {otherStudents.length === 0 && <Typography>You have no other students.</Typography>}
                    {otherStudents.length > 0 && getTable(otherStudents, timeZone, lastSessionByStudent, nextAppointmentByStudent)}
                </CardContent>
            </Card>
        </Stack>

    );
}

const getTable = (
    students: StudentRow[],
    timezone: string,
    lastSessionByStudent: Map<string, { id: string, start: string, tickets: { lesson_identifier: string, passed: boolean }[] }>,
    nextAppointmentByStudent: Map<string, { start: string, trainer_name: string, lessons: { identifier: string }[] }>,
) => (
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
                {students.map(student => {
                    const lastSession = lastSessionByStudent.get(student.id);
                    const nextAppointment = nextAppointmentByStudent.get(student.id);
                    return (<TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.rating}</TableCell>
                        <TableCell>
                            {lastSession ? (
                                <Tooltip title={formatZuluDate(new Date(lastSession.start))}>
                                    <Chip
                                        label={getTimeAgo(new Date(lastSession.start))}
                                        size="small"
                                        color={(() => {
                                            const lastSessionDate = new Date(lastSession.start);
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
                        <TableCell>{lastSession ? lastSession.tickets.map((ticket, i) =>
                            <Chip size="small"
                                  key={i}
                                  label={ticket.lesson_identifier}
                                  color={ticket.passed ? 'success' : 'error'}
                                  sx={{mr: 1,}}
                            />) : 'N/A'}
                        </TableCell>
                        <TableCell>
                            {nextAppointment ? (
                                <Tooltip
                                    title={`${formatTimezoneDate(new Date(nextAppointment.start), timezone)} with ${nextAppointment.trainer_name}: ${nextAppointment.lessons.map((l) => l.identifier).join(', ')}`}>
                                    <Link
                                        href={`/training/appointments?sortField=start&sortDirection=asc&filterField=student&filterValue=${student.cid}&filterOperator=equals`}>
                                        <Chip
                                            label={getTimeIn(new Date(nextAppointment.start))}
                                            size="small"
                                            color="info"
                                        />
                                    </Link>
                                </Tooltip>
                            ) : ''}
                        </TableCell>
                        <TableCell>
                            {lastSession ? (
                                <Tooltip title="View Last Training Session">
                                    <Link href={`/training/sessions/${lastSession.id}`} target="_blank">
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
                                <Link href={`/training/assignments/${student.trainingAssignmentId}`} target="_blank">
                                    <IconButton>
                                        <People/>
                                    </IconButton>
                                </Link>
                            </Tooltip>
                            <TrainerSideRequestButton studentId={student.id}/>
                        </TableCell>
                    </TableRow>);
                })}
            </TableBody>
        </Table>
    </TableContainer>
);
