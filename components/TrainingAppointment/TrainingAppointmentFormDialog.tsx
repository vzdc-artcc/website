'use client';
import React, {useState} from 'react';
import timezone from "dayjs/plugin/timezone";
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stack,
    TextField
} from "@mui/material";
import {Add, Edit, Save} from "@mui/icons-material";
import {Student} from "@/app/training/your-students/page";
import {User} from "next-auth";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Lesson} from "@prisma/client";
import {createOrUpdateTrainingAppointment} from "@/actions/trainingAppointment";
import {toast} from "react-toastify";
import {formatZuluDate} from "@/lib/date";

export default function TrainingAppointmentFormDialog({
                                                          trainingAppointment,
                                                          assignedStudents,
                                                          allStudents,
                                                          allLessons
                                                      }: {
    trainingAppointment?: { id: string, studentId: string, start: Date, lessonIds: string[], },
    assignedStudents: Student[],
    allStudents: User[],
    allLessons: Lesson[],
}) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [open, setOpen] = useState(false);
    const [student, setStudent] = useState(trainingAppointment?.studentId || '');
    const [start, setStart] = useState<Dayjs | null>(dayjs.utc(trainingAppointment?.start || new Date()).tz("America/New_York"));
    const [lessons, setLessons] = useState<Lesson[]>(trainingAppointment?.lessonIds.map((id) => allLessons.find((l) => l.id === id)).filter((l) => l !== undefined) as Lesson[] || []);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        const {errors} = await createOrUpdateTrainingAppointment(student, start?.utc().toISOString() || '', lessons.map((l) => l.id), trainingAppointment?.id);

        if (errors) {
            toast.error(errors.map((e) => e.message).join(', '));
            setLoading(false);
            return;
        }

        toast.success(`Training appointment ${trainingAppointment?.id ? 'updated' : 'created'} successfully`);
        setOpen(false);
        if (!trainingAppointment) {
            setStudent('');
            setStart(dayjs.utc(new Date()).tz("America/New_York"));
            setLessons([]);
        }
        setLoading(false);
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            {!trainingAppointment && <Button variant="contained" startIcon={<Add/>} onClick={() => setOpen(true)}>
                New Appointment
            </Button>}
            {trainingAppointment && <IconButton size="small" onClick={() => setOpen(true)}>
                <Edit fontSize="small"/>
            </IconButton>}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{trainingAppointment ? 'Edit' : 'New'} Training Appointment</DialogTitle>
                <DialogContent>
                    <Stack direction="column" spacing={2} sx={{p: 1,}}>
                        <Autocomplete
                            options={allStudents.sort((a, b) => {
                                if (assignedStudents.some((s) => s.user.id === a.id) && assignedStudents.some((s) => s.user.id === b.id)) {
                                    return a.lastName.localeCompare(b.lastName);
                                } else if (assignedStudents.some((s) => s.user.id === a.id)) {
                                    return -1;
                                } else if (assignedStudents.some((s) => s.user.id === b.id)) {
                                    return 1;
                                }
                                return 0;
                            })}
                            disabled={!!trainingAppointment}
                            groupBy={(option) =>
                                assignedStudents.some((s) => s.user.id === option.id) ? 'Your Students' : 'All Students'
                            }
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                            value={allStudents.find((u) => u.id === student) || null}
                            onChange={(event, newValue) => {
                                setStudent(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => <TextField {...params} required label="Student"/>}
                        />
                        <DateTimePicker sx={{width: '100%',}} name="start" label="Start (Eastern Time)" value={start}
                                        disablePast ampm={false} onChange={setStart}/>
                        <Autocomplete
                            options={allLessons}
                            multiple
                            getOptionLabel={(option) => `${option.identifier} - ${option.name}`}
                            renderInput={(params) => <TextField {...params} required label="Lesson(s)"/>}
                            value={lessons}
                            onChange={(event, newValue) => {
                                setLessons(newValue);
                            }}
                        />
                        <DialogContentText>Estimated session
                            duration: {lessons.length === 0 ? 'N/A' : `${lessons.map((l) => l.duration).reduce((p, c, i) => {
                                return i === 0 ? c : p + c;
                            })} minutes`}</DialogContentText>
                        <DialogContentText>Estimated end date and time: {start && lessons.length > 0 ?
                            formatZuluDate(start.add(lessons.map((l) => l.duration).reduce((p, c, i) => {
                                return i === 0 ? c : p + c;
                            }), "minutes").toDate())
                            : 'N/A'}</DialogContentText>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={() => handleCreate()} variant="contained"
                            startIcon={trainingAppointment ? <Save/> : <Add/>} disabled={loading}>
                        {trainingAppointment ? 'Save' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}