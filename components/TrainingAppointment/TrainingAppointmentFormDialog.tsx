'use client';
import React, {useMemo, useState} from 'react';
import timezone from "dayjs/plugin/timezone";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {Add, Delete, Edit, ExpandMore, Save} from "@mui/icons-material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {toast} from "react-toastify";
import TrainingAppointmentAdditionalTrainerForm from "@/components/TrainingAppointment/TrainingAppointmentAdditionalTrainerForm";
import {
    useCreateTrainingAppointment,
    useTrainingAssignments,
    useTrainingLessons,
    useUpdateTrainingAppointment,
} from "@/lib/osmium/hooks/training";
import {useRosterControllers, useUsersByRole} from "@/lib/osmium/hooks/users";
import {syncAppointmentAtcBooking} from "@/lib/osmium/atcBookingSync";

interface AppointmentLike {
    id: string;
    student_id: string;
    start: string;
    lessons: { id: string }[];
    additional_trainers: { trainer_id: string, description: string }[];
    notes: string;
    environment?: string | null;
    atc_booking_id?: string | null;
}

export default function TrainingAppointmentFormDialog({timeZone, currentUserCid, appointment}: {
    timeZone: string,
    currentUserCid?: string,
    appointment?: AppointmentLike,
}) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [open, setOpen] = useState(false);
    const [studentId, setStudentId] = useState(appointment?.student_id || '');
    const [start, setStart] = useState<Dayjs | null>(dayjs.utc(appointment?.start || new Date()).tz(timeZone).add(appointment ? 0 : 2, "hours"));
    const [lessonIds, setLessonIds] = useState<string[]>(appointment?.lessons.map((l) => l.id) || []);
    const [notes, setNotes] = useState(appointment?.notes || '');
    const [loading, setLoading] = useState(false);
    const [additionalTrainers, setAdditionalTrainers] = useState<{ trainerId: string, description: string }[]>(
        appointment?.additional_trainers.map((at) => ({trainerId: at.trainer_id, description: at.description})) || []
    );

    const {data: lessonsData} = useTrainingLessons();
    const allLessons = lessonsData?.items ?? [];
    const {data: rosterData} = useRosterControllers();
    const {data: instructorsData} = useUsersByRole('INS');
    const {data: mentorsData} = useUsersByRole('MTR');
    const {data: assignmentsData} = useTrainingAssignments();
    const createAppointment = useCreateTrainingAppointment();
    const updateAppointment = useUpdateTrainingAppointment();

    const allStudents = (rosterData?.items ?? [])
        .filter((u) => !!u.full)
        .map((u) => ({
            id: u.full!.id,
            cid: u.basic.cid,
            name: `${u.full!.first_name ?? ''} ${u.full!.last_name ?? ''}`.trim() || u.basic.name,
        }));

    const allTrainers = useMemo(() => {
        const merged = new Map<string, { id: string, cid: number, name: string, initials?: string | null }>();
        for (const item of [...(instructorsData?.items ?? []), ...(mentorsData?.items ?? [])]) {
            if (!item.full) continue;
            merged.set(item.full.id, {
                id: item.full.id,
                cid: item.basic.cid,
                name: `${item.full.first_name ?? ''} ${item.full.last_name ?? ''}`.trim() || item.basic.name,
                initials: item.full.operating_initials,
            });
        }
        return Array.from(merged.values());
    }, [instructorsData, mentorsData]);

    const myOsmiumId = useMemo(() => {
        const myCid = currentUserCid ? Number(currentUserCid) : undefined;
        if (!myCid) return undefined;
        const pool = [...(rosterData?.items ?? []), ...(instructorsData?.items ?? []), ...(mentorsData?.items ?? [])];
        return pool.find((u) => u.basic.cid === myCid && !!u.full)?.full?.id;
    }, [currentUserCid, rosterData, instructorsData, mentorsData]);

    const assignedStudentIds = useMemo(() => {
        if (!myOsmiumId) return [] as string[];
        return (assignmentsData?.items ?? [])
            .filter((a) => a.primary_trainer_id === myOsmiumId || a.other_trainer_ids.includes(myOsmiumId))
            .map((a) => a.student_id);
    }, [assignmentsData, myOsmiumId]);

    const handleCreate = async () => {
        if (!studentId || !start || lessonIds.length === 0) {
            toast.error('Student, start time, and at least one lesson are required.');
            return;
        }

        setLoading(true);
        try {
            const body = {
                student_id: studentId,
                start: start.utc().toISOString(),
                lesson_ids: lessonIds,
                notes: notes || undefined,
                additional_trainers: additionalTrainers.map((at) => ({
                    trainer_id: at.trainerId,
                    description: at.description
                })),
            };

            const result = appointment
                ? await updateAppointment.mutateAsync({appointmentId: appointment.id, body})
                : await createAppointment.mutateAsync(body);

            if (!result) {
                throw new Error('No response from server.');
            }

            const liveLesson = result.lessons.find((l) => l.location === 1);
            const resolvedPosition = liveLesson ? allLessons.find((l) => l.id === liveLesson.id)?.position : undefined;

            const {atcBookingId, error: atcError} = await syncAppointmentAtcBooking({
                trainerCid: result.trainer_cid,
                start: result.start,
                existingAtcBookingId: result.atc_booking_id,
                liveLesson: liveLesson && resolvedPosition ? {
                    duration: liveLesson.duration,
                    position: resolvedPosition
                } : null,
            });

            if (atcError) {
                toast.error(`Appointment saved, but encountered an error with the ATC booking: ${atcError}`);
            }

            if (atcBookingId !== (result.atc_booking_id ?? null)) {
                await updateAppointment.mutateAsync({
                    appointmentId: result.id,
                    body: {
                        student_id: result.student_id,
                        start: result.start,
                        lesson_ids: result.lessons.map((l) => l.id),
                        notes: result.notes || undefined,
                        environment: result.environment ?? undefined,
                        additional_trainers: result.additional_trainers.map((at) => ({
                            trainer_id: at.trainer_id,
                            description: at.description
                        })),
                        atc_booking_id: atcBookingId,
                    },
                });
            }

            toast.success(`Training appointment ${appointment ? 'updated' : 'created'} successfully`);
            setOpen(false);
            if (!appointment) {
                setStudentId('');
                setStart(dayjs.utc(new Date()).tz(timeZone));
                setLessonIds([]);
                setNotes('');
                setAdditionalTrainers([]);
            }
        } catch (err) {
            const errors = (err as { errors?: { message: string }[] })?.errors;
            toast.error(errors?.map((e) => e.message).join(', ') || 'Failed to save training appointment.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            {!appointment && <Button variant="contained" startIcon={<Add/>} onClick={() => setOpen(true)}>
                New Appointment
            </Button>}
            {appointment && <IconButton size="small" onClick={() => setOpen(true)}>
                <Edit fontSize="small"/>
            </IconButton>}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{appointment ? 'Edit' : 'New'} Training Appointment</DialogTitle>
                <DialogContent>
                    <Stack direction="column" spacing={2} sx={{p: 1,}}>
                        <Autocomplete
                            options={allStudents.slice().sort((a, b) => {
                                if (assignedStudentIds.includes(a.id) && assignedStudentIds.includes(b.id)) {
                                    return a.name.localeCompare(b.name);
                                } else if (assignedStudentIds.includes(a.id)) {
                                    return -1;
                                } else if (assignedStudentIds.includes(b.id)) {
                                    return 1;
                                }
                                return 0;
                            })}
                            disabled={!!appointment}
                            groupBy={(option) =>
                                assignedStudentIds.includes(option.id) ? 'Your Students' : 'All Students'
                            }
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            getOptionLabel={(option) => `${option.name} (${option.cid})`}
                            value={allStudents.find((u) => u.id === studentId) || null}
                            onChange={(event, newValue) => {
                                setStudentId(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => <TextField {...params} required label="Student"/>}
                        />
                        <DateTimePicker sx={{width: '100%',}} name="start" label="Start" value={start}
                                        disablePast ampm={false} onChange={setStart}/>
                        <Autocomplete
                            options={allLessons}
                            multiple
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            getOptionLabel={(option) => `${option.identifier} - ${option.name} (${option.duration} mins)`}
                            renderInput={(params) => <TextField {...params} required label="Lesson(s)"/>}
                            value={allLessons.filter((l) => lessonIds.includes(l.id))}
                            onChange={(event, newValue) => {
                                setLessonIds(newValue.map((l) => l.id));
                            }}
                        />
                        <TextField fullWidth variant="filled" label="Trainer only notes (optional)" value={notes}
                                   onChange={(e) => setNotes(e.target.value.toUpperCase())}/>
                        <Divider/>
                        {additionalTrainers.map((at) => (<Typography
                            key={at.trainerId}>{allTrainers.find((t) => t.id === at.trainerId)?.name}: {at.description}
                            <IconButton size="small" onClick={() => {
                                setAdditionalTrainers((prev) => prev.filter((t) => t.trainerId !== at.trainerId));
                                toast.success("Removed additional trainer.");
                            }}><Delete fontSize="inherit"/></IconButton></Typography>))}
                        {additionalTrainers.length > 0 && <Divider/>}
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography>Add Additional Trainer</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TrainingAppointmentAdditionalTrainerForm allTrainers={allTrainers}
                                                                          onSubmit={(trainerId, description) => {
                                                                              if (additionalTrainers.map((at) => at.trainerId).includes(trainerId)) {
                                                                                  toast.error("You cannot add the same additional trainer twice.");
                                                                                  return;
                                                                              }

                                                                              setAdditionalTrainers((prev) => [...prev, {
                                                                                  trainerId,
                                                                                  description,
                                                                              }]);
                                                                              toast.success("Additional trainer added successfully!");
                                                                          }}/>
                            </AccordionDetails>
                        </Accordion>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={() => handleCreate()} variant="contained"
                            startIcon={appointment ? <Save/> : <Add/>} disabled={loading}>
                        {appointment ? 'Save' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
