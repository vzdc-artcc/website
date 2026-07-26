'use client';
import React, {useEffect, useMemo, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Stack,
    Switch,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {notFound, useRouter, useSearchParams} from "next/navigation";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import TrainingTicketForm from "@/components/TrainingSession/TrainingTicketForm";
import {Add, Delete, ExpandMore} from "@mui/icons-material";
import {toast} from "react-toastify";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import TrainingSessionPerformanceIndicatorForm, {
    PiFormState
} from "@/components/TrainingSession/TrainingSessionPerformanceIndicatorForm";
import TrainingSessionAfterSubmitDialogs from "@/components/TrainingSession/TrainingSessionAfterSubmitDialogs";
import {
    useCreateTrainingSession,
    useTrainingAssignments,
    useTrainingLessons,
    useTrainingSession,
    useUpdateTrainingSession,
} from "@/lib/osmium/hooks/training";
import {useRosterControllers, useUsersByRole} from "@/lib/osmium/hooks/users";
import {useMe} from "@/lib/osmium/hooks/me";

interface LessonLike {
    id: string;
    identifier: string;
    name: string;
    performance_indicator_template_id?: string | null;
}

interface ScoreLike {
    criteria_id: string;
    cell_id: string;
    passed: boolean;
}

interface TicketState {
    passed: boolean;
    lesson: LessonLike;
    scores: ScoreLike[];
}

interface AdditionalTrainerState {
    trainerId: string;
    description: string;
    name: string;
}

interface AfterSubmitState {
    release?: { id: string } | null;
    rosterChanges?: { id: string, dossier_text: string, certification_option: string }[];
    otsRec?: { id: string } | null;
}

export default function TrainingSessionForm({sessionId}: {
    sessionId?: string,
}) {

    const router = useRouter();
    const theme = useTheme();
    const searchParams = useSearchParams();

    // Identity from osmium's /me (Phase 6). mentorOwnerOnly preserves the
    // legacy 3-tier `MENTOR && !INSTRUCTOR && !STAFF` restriction on raw
    // role names — a plain mentor may only edit sessions they ran.
    const {data: me} = useMe();
    const timeZone = me?.profile.timezone ?? 'America/New_York';
    const currentUserCid = me ? String(me.cid) : undefined;
    const mentorOwnerOnly = !!me && me.role_names.includes("MTR")
        && !me.role_names.includes("INS") && !me.role_names.includes("STAFF");

    const {data: existingSession, isLoading: sessionLoading} = useTrainingSession(sessionId);
    const {data: lessonsData, isLoading: lessonsLoading} = useTrainingLessons();
    const {data: rosterData, isLoading: rosterLoading} = useRosterControllers();
    const {data: instructorsData, isLoading: instructorsLoading} = useUsersByRole('INS');
    const {data: mentorsData, isLoading: mentorsLoading} = useUsersByRole('MTR');
    const {data: staffData, isLoading: staffLoading} = useUsersByRole('STAFF');
    const {data: assignmentsData} = useTrainingAssignments();
    const createSession = useCreateTrainingSession();
    const updateSession = useUpdateTrainingSession();

    const [afterSubmit, setAfterSubmit] = useState<AfterSubmitState>();
    const renderAfterDialogs = !!afterSubmit && (!!afterSubmit.release ||
        (!!afterSubmit.rosterChanges && afterSubmit.rosterChanges.length > 0) || !!afterSubmit.otsRec);

    const [hydrated, setHydrated] = useState(false);
    const [student, setStudent] = useState<string>(searchParams.get('student') || '');
    const [start, setStart] = useState<Date>(new Date());
    const [end, setEnd] = useState<Date>(new Date());
    const [performanceIndicator, setPerformanceIndicator] = useState<PiFormState>();
    const [agreeEditPerformanceIndicator, setAgreeEditPerformanceIndicator] = useState(false);
    const [trainingTickets, setTrainingTickets] = useState<TicketState[]>([]);
    const [additionalTrainers, setAdditionalTrainers] = useState<AdditionalTrainerState[]>([]);
    const [additionalTrainerSelected, setAdditionalTrainerSelected] = useState<string>();
    const [additionalTrainerDescription, setAdditionalTrainerDescription] = useState<string>();
    const [additionalNotes, setAdditionalNotes] = useState<string>('');
    const [trainerNotes, setTrainerNotes] = useState<string>('');
    const [enableMarkdown, setEnableMarkdown] = useState<boolean>(false);

    const allLessons: LessonLike[] = lessonsData?.items ?? [];

    useEffect(() => {
        if (hydrated || !existingSession || lessonsLoading) return;

        setStudent(existingSession.student_id);
        setStart(new Date(existingSession.start));
        setEnd(new Date(existingSession.end));
        setAdditionalNotes(existingSession.additional_comments || '');
        setTrainerNotes(existingSession.trainer_comments || '');
        setEnableMarkdown(existingSession.enable_markdown);
        setTrainingTickets(existingSession.tickets.map((ticket) => {
            const lesson = allLessons.find((l) => l.id === ticket.lesson_id) || {
                id: ticket.lesson_id,
                identifier: '',
                name: '',
            };
            return {
                passed: ticket.passed,
                lesson,
                scores: ticket.scores.map((s) => ({criteria_id: s.criteria_id, cell_id: s.cell_id, passed: s.passed})),
            };
        }));
        setAdditionalTrainers(existingSession.additional_trainers.map((t) => ({
            trainerId: t.trainer_id,
            description: t.description,
            name: t.trainer_name,
        })));
        if (existingSession.performance_indicator) {
            setPerformanceIndicator({
                categories: existingSession.performance_indicator.categories.map((c) => ({
                    id: c.id,
                    name: c.name,
                    order: c.order,
                    criteria: c.criteria.map((cr) => ({
                        id: cr.id,
                        name: cr.name,
                        order: cr.order,
                        marker: (cr.marker as 'OBSERVED' | 'NOT_OBSERVED' | null) ?? null,
                        comments: cr.comments ?? null,
                    })),
                })),
            });
        }
        setHydrated(true);
    }, [existingSession, lessonsLoading, allLessons, hydrated]);

    useEffect(() => {
        if (!mentorOwnerOnly || !existingSession) return;
        if (String(existingSession.instructor_cid) !== currentUserCid) {
            router.replace(`/training/sessions/${existingSession.id}`);
        }
    }, [mentorOwnerOnly, existingSession, currentUserCid, router]);

    const students = (rosterData?.items ?? [])
        .filter((u) => !!u.full)
        .map((u) => ({
            id: u.full!.id,
            cid: u.basic.cid,
            name: `${u.full!.first_name ?? ''} ${u.full!.last_name ?? ''}`.trim() || u.basic.name,
        }));

    const trainers = useMemo(() => {
        const merged = new Map<string, { id: string, cid: number, name: string, initials?: string | null }>();
        for (const item of [...(instructorsData?.items ?? []), ...(mentorsData?.items ?? []), ...(staffData?.items ?? [])]) {
            if (!item.full) continue;
            merged.set(item.full.id, {
                id: item.full.id,
                cid: item.basic.cid,
                name: `${item.full.first_name ?? ''} ${item.full.last_name ?? ''}`.trim() || item.basic.name,
                initials: item.full.operating_initials,
            });
        }
        return Array.from(merged.values());
    }, [instructorsData, mentorsData, staffData]);

    const myOsmiumId = useMemo(() => {
        const myCid = currentUserCid ? Number(currentUserCid) : undefined;
        if (!myCid) return undefined;
        const pool = [...(rosterData?.items ?? []), ...(instructorsData?.items ?? []), ...(mentorsData?.items ?? []), ...(staffData?.items ?? [])];
        return pool.find((u) => u.basic.cid === myCid && !!u.full)?.full?.id;
    }, [currentUserCid, rosterData, instructorsData, mentorsData, staffData]);

    const yourStudentIds = useMemo(() => {
        if (!myOsmiumId) return [] as string[];
        return (assignmentsData?.items ?? [])
            .filter((a) => a.primary_trainer_id === myOsmiumId || a.other_trainer_ids.includes(myOsmiumId))
            .map((a) => a.student_id);
    }, [assignmentsData, myOsmiumId]);

    if (sessionId && !sessionLoading && !existingSession) {
        notFound();
    }

    const allLoading = sessionLoading || lessonsLoading || rosterLoading || instructorsLoading || mentorsLoading
        || staffLoading || (!!sessionId && !hydrated);

    const redirect = (id?: string) => {
        const targetId = id || existingSession?.id;
        if (targetId) {
            router.replace(`/training/sessions/${targetId}`);
        } else {
            router.replace(`/training/sessions`);
        }
    }

    const handleSubmit = async () => {
        if (!student) {
            toast.error('Student is required.');
            return;
        }

        const body = {
            student_id: student,
            start: start.toISOString(),
            end: end.toISOString(),
            additional_comments: additionalNotes || undefined,
            trainer_comments: trainerNotes || undefined,
            enable_markdown: enableMarkdown,
            tickets: trainingTickets.map((t) => ({
                lesson_id: t.lesson.id,
                passed: t.passed,
                scores: t.scores.map((s) => ({criteria_id: s.criteria_id, cell_id: s.cell_id, passed: s.passed})),
            })),
            performance_indicator: performanceIndicator ? {
                categories: performanceIndicator.categories.map((c) => ({
                    name: c.name,
                    order: c.order,
                    criteria: c.criteria.map((cr) => ({
                        name: cr.name,
                        order: cr.order,
                        marker: cr.marker ?? '',
                        comments: cr.comments ?? undefined,
                    })),
                })),
            } : undefined,
            additional_trainers: additionalTrainers.map((t) => ({trainer_id: t.trainerId, description: t.description})),
        };

        try {
            const result = existingSession
                ? await updateSession.mutateAsync({sessionId: existingSession.id, body})
                : await createSession.mutateAsync(body);

            toast.success('Training session saved successfully!');

            if (result && (result.release || (result.roster_updates && result.roster_updates.length > 0) || result.ots_recommendation)) {
                setAfterSubmit({
                    release: result.release,
                    rosterChanges: result.roster_updates,
                    otsRec: result.ots_recommendation,
                });
            } else {
                redirect(result?.session?.id);
            }
        } catch (err) {
            const errors = (err as { errors?: { message: string }[] })?.errors;
            if (errors && errors.length > 0) {
                toast(errors.map((e) => e.message).join(".  "), {type: 'error'});
            } else {
                toast.error('Failed to save training session.');
            }
        }
    }

    if (allLoading) {
        return <CircularProgress/>;
    }

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const addAdditionalTrainer = () => {
        if (!additionalTrainerSelected || !additionalTrainerDescription) {
            toast.error("All fields are required.");
            return;
        }

        const trainer = trainers.find((t) => t.id === additionalTrainerSelected);
        if (!trainer) return;

        setAdditionalTrainers((prev) => [...prev, {
            trainerId: trainer.id,
            description: additionalTrainerDescription.toUpperCase(),
            name: trainer.name,
        }]);

        setAdditionalTrainerSelected('');
        setAdditionalTrainerDescription('');
        toast.success("Additional Trainer added!");
    }

    const removeAdditionalTrainer = (trainerId: string) => {
        setAdditionalTrainers((prev => prev.filter((t) => t.trainerId !== trainerId)));
    }

    return (
        (<LocalizationProvider dateAdapter={AdapterDayjs}>
            {renderAfterDialogs &&
                <TrainingSessionAfterSubmitDialogs onAllClose={() => redirect()} release={afterSubmit?.release}
                                                   otsRec={afterSubmit?.otsRec} rosterChanges={afterSubmit?.rosterChanges}/>}
            <form action={handleSubmit}>
                <Grid container columns={2} spacing={2}>
                    <Grid size={2}>
                        <Autocomplete
                            options={students.slice().sort((a, b) => {
                                if (yourStudentIds.includes(a.id) && yourStudentIds.includes(b.id)) {
                                    return a.name.localeCompare(b.name);
                                } else if (yourStudentIds.includes(a.id)) {
                                    return -1;
                                } else if (yourStudentIds.includes(b.id)) {
                                    return 1;
                                }
                                return 0;
                            })}
                            groupBy={(option) =>
                                yourStudentIds.includes(option.id) ? 'Your Students' : 'All Students'
                            }
                            getOptionLabel={(option) => `${option.name} (${option.cid})`}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            value={students.find((u) => u.id === student) || null}
                            onChange={(event, newValue) => {
                                setStudent(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => <TextField {...params} label="Student"/>}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} label="Start" value={dayjs.utc(start).tz(timeZone)}
                                        onChange={(d) => setStart(d?.toDate() || new Date())}/>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} label="End" value={dayjs.utc(end).tz(timeZone)}
                                        onChange={(d) => setEnd(d?.toDate() || new Date())}/>
                    </Grid>
                    <Grid size={2}>
                        <Accordion variant="outlined">
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography variant="h6">Additional Trainers</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="subtitle2" sx={{mb: 2,}}>Additional trainers will not receive hours
                                    for this session. You will be considered the primary trainer for this training
                                    session.</Typography>
                                <Autocomplete
                                    options={trainers.filter((t) => t.id !== student && !additionalTrainers.map((at) => at.trainerId).includes(t.id))}
                                    getOptionLabel={(option) => `${option.name} (${option.initials || option.cid})`}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                    value={trainers.find((t) => t.id === additionalTrainerSelected) || null}
                                    onChange={(_event, newValue) => {
                                        setAdditionalTrainerSelected(newValue ? newValue.id : '');
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Trainer"/>}
                                />
                                <TextField variant="outlined" fullWidth label="Desciption"
                                           placeholder="What did this trainer do (commands, voices, mentor training, etc.)?"
                                           value={additionalTrainerDescription} onChange={(e) => {
                                    setAdditionalTrainerDescription(e.target.value || '');
                                }} sx={{my: 2,}} slotProps={{
                                    htmlInput: {maxLength: 100,},
                                }}/>
                                <Button variant="contained" size="small" onClick={addAdditionalTrainer}
                                        startIcon={<Add/>}>Add</Button>
                                <Divider sx={{my: 2,}}/>
                                {additionalTrainers.length === 0 &&
                                    <Typography>No additional trainers added.</Typography>}
                                {additionalTrainers.map((at) =>
                                    <Typography key={at.trainerId}>{at.name} - {at.description}
                                        <IconButton size="small"
                                                    onClick={() => removeAdditionalTrainer(at.trainerId)}><Delete
                                            fontSize="inherit"/></IconButton></Typography>)}
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid size={2}>
                        {trainingTickets.length > 0 && <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" sx={{mb: 2,}}>Training Ticket(s)</Typography>
                                {trainingTickets.map((ticket, index) => (
                                    <Accordion key={index}>
                                        <AccordionSummary expandIcon={<ExpandMore/>}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography>{ticket.lesson.identifier} - {ticket.lesson.name}</Typography>
                                                <IconButton
                                                    component="span"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTrainingTickets(trainingTickets.filter((tt, i) => i !== index));
                                                    }}>
                                                    <Delete/>
                                                </IconButton>
                                                <Chip label={ticket.passed ? 'PASS' : 'FAIL'}
                                                      color={ticket.passed ? 'success' : 'error'}/>
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TrainingTicketForm lesson={ticket.lesson}
                                                                scores={ticket.scores}
                                                                onSubmit={(lesson, scores) => {
                                                                    setTrainingTickets((prev) => {
                                                                        return prev.map((t, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    passed: scores.every((score) => score.passed),
                                                                                    lesson,
                                                                                    scores,
                                                                                }
                                                                            }
                                                                            return t;
                                                                        });
                                                                    });
                                                                    toast('Ticket saved', {type: 'success'});
                                                                    return true;
                                                                }}/>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </CardContent>
                        </Card>}
                    </Grid>
                    <Grid size={2}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" sx={{mb: 2,}}>New Training Ticket</Typography>
                                <TrainingTicketForm onSubmit={(lesson, scores) => {
                                    if (trainingTickets.map((t) => t.lesson.id).flat().includes(lesson.id)) {
                                        toast('Lesson already added', {type: 'error'});
                                        return false;
                                    }
                                    setTrainingTickets((prev) => {
                                        return [
                                            ...prev,
                                            {
                                                passed: scores.every((score) => score.passed),
                                                lesson,
                                                scores,
                                            },
                                        ];
                                    });
                                    toast('Ticket saved', {type: 'success'});
                                    return true;
                                }}/>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={2}>
                        <Accordion variant="outlined" defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography variant="h6">Performance Indicator</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {existingSession && !agreeEditPerformanceIndicator &&
                                    <Alert severity="warning" sx={{mb: 2,}}
                                           action={
                                               <Button color="inherit" size="small"
                                                       onClick={() => setAgreeEditPerformanceIndicator(true)}>
                                                   Yes
                                               </Button>
                                           }>Performance Indicators are meant to be filled out immediately after the
                                        session. Editing it now will reset the performance indicator upon saving this
                                        session. The changes you make here will ONLY take affect IF you save this
                                        training session. Are you sure you would like to modify the performance
                                        indicator?</Alert>}
                                {trainingTickets.length === 0 &&
                                    <Typography>You must add at least one training ticket first.</Typography>}
                                {trainingTickets.length > 0 && (!existingSession || agreeEditPerformanceIndicator) &&
                                    <TrainingSessionPerformanceIndicatorForm lesson={trainingTickets[0].lesson}
                                                                             onChange={setPerformanceIndicator}/>}
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid size={2}>
                        <Box sx={{}} data-color-mode={theme.palette.mode}>
                        <FormControlLabel control={<Switch onChange={()=>setEnableMarkdown(!enableMarkdown)}/>} label="Enable Markdown Editor" />
                            <Typography variant="subtitle1" sx={{mb: 1,}}>Additional Comments</Typography>
                            {enableMarkdown ?
                                <MarkdownEditor
                                    enableScroll={false}
                                    minHeight="200px"
                                    value={additionalNotes}
                                    onChange={(d) => setAdditionalNotes(d)}
                                />
                                :
                                <TextField
                                    multiline
                                    fullWidth
                                    sx={{minHeight:"200px"}}
                                    minRows={10}
                                    variant="outlined"
                                    value={additionalNotes}
                                    onChange={(d)=>setAdditionalNotes(d.target.value)}
                                />
                            }
                        </Box>
                    </Grid>
                    <Grid size={2}>
                        <Box sx={{}} data-color-mode={theme.palette.mode}>
                            <Typography variant="subtitle1" sx={{mb: 1,}}>Trainer Comments</Typography>
                            {enableMarkdown ?
                                <MarkdownEditor
                                    enableScroll={false}
                                    minHeight="200px"
                                    value={trainerNotes}
                                    onChange={(d) => {setTrainerNotes(d)}}
                                />
                                :
                                <TextField
                                    multiline
                                    fullWidth
                                    sx={{minHeight:"200px"}}
                                    minRows={10}
                                    variant="outlined"
                                    value={trainerNotes}
                                    onChange={(d)=>setTrainerNotes(d.target.value)}
                                />
                            }
                        </Box>
                    </Grid>
                    <Grid size={2}>
                        <FormSaveButton/>
                    </Grid>
                </Grid>
            </form>
        </LocalizationProvider>)
    );

}
