'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {
    CommonMistake,
    Lesson,
    RubricCriteraScore,
    TrainingSession,
    TrainingSessionPerformanceIndicator,
    TrainingSessionPerformanceIndicatorCategory,
    TrainingSessionPerformanceIndicatorCriteria
} from "@prisma/client";
import {getAllData, getTicketsForSession} from "@/actions/trainingSessionFormHelper";
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Grid2,
    IconButton,
    Stack,
    Switch,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import {User} from "next-auth";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import TrainingTicketForm from "@/components/TrainingSession/TrainingTicketForm";
import {Delete, ExpandMore} from "@mui/icons-material";
import {toast} from "react-toastify";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateTrainingSession} from "@/actions/trainingSession"
import utc from "dayjs/plugin/utc";
import TrainingSessionPerformanceIndicatorForm
    from "@/components/TrainingSession/TrainingSessionPerformanceIndicatorForm";

export type TrainingSessionIndicatorCategoryWithAll = TrainingSessionPerformanceIndicatorCategory & {
    criteria: TrainingSessionPerformanceIndicatorCriteria[],
}

export type TrainingSessionIndicatorWithAll = TrainingSessionPerformanceIndicator & {
    categories: TrainingSessionIndicatorCategoryWithAll[],
}

export default function TrainingSessionForm({trainingSession,}: { trainingSession?: TrainingSession, }) {

    const router = useRouter();
    const theme = useTheme();
    const searchParams = useSearchParams();
    const [releaseDialogOpen, setReleaseDialogOpen] = useState<TrainingSession | null>();
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [allCommonMistakes, setAllCommonMistakes] = useState<CommonMistake[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allLoading, setAllLoading] = useState<boolean>(true);
    const [student, setStudent] = useState<string>(trainingSession?.studentId || searchParams.get('student') || '');
    const [start, setStart] = useState<Date | string>(trainingSession?.start || new Date());
    const [end, setEnd] = useState<Date | string>(trainingSession?.end || new Date());
    const [performanceIndicator, setPerformanceIndicator] = useState<TrainingSessionIndicatorWithAll>();
    const [agreeEditPerformanceIndicator, setAgreeEditPerformanceIndicator] = useState(false);
    const [trainingTickets, setTrainingTickets] = useState<{
        passed: boolean,
        lesson: Lesson,
        mistakes: CommonMistake[],
        scores: RubricCriteraScore[],
    }[]>([]);
    const [additionalNotes, setAdditionalNotes] = useState<string>(trainingSession?.additionalComments || '');
    const [trainerNotes, setTrainerNotes] = useState<string>(trainingSession?.trainerComments || '');
    const [enableMarkdown, setEnableMarkdown] = useState<boolean>(false);

    const getInitialData = useCallback(async () => {
        setAllLoading(true);
        const {lessons, commonMistakes, users} = await getAllData();
        setAllLessons(lessons.sort(({identifier:a},{identifier:b})=>a.localeCompare(b)));
        setAllCommonMistakes(commonMistakes);
        setAllUsers(users as User[]);
        setAllLoading(false);
        if (trainingSession) {
            const tickets = await getTicketsForSession(trainingSession.id);
            setTrainingTickets(tickets.map((ticket) => {
                return {
                    passed: ticket.scores.every((score) => score.passed),
                    lesson: ticket.lesson,
                    mistakes: ticket.mistakes,
                    scores: ticket.scores,
                }
            }));
        }
    }, [trainingSession]);

    const handleSubmit = async () => {

        const {
            session,
            release,
            errors
        } = await createOrUpdateTrainingSession(
            student,
            start,
            end,
            trainingTickets,
            additionalNotes,
            trainerNotes,
            enableMarkdown,
            trainingSession ? (agreeEditPerformanceIndicator ? performanceIndicator : undefined) : performanceIndicator,
            trainingSession?.id);

        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'});
            return;
        }

        if (release) {
            setReleaseDialogOpen(session);
        } else {
            redirect(session);
        }

        toast("Training session saved successfully!", {type: 'success'});

    }

    const redirect = (session?: TrainingSession) => {
        if (!trainingSession?.id) {
            if (session){
                router.replace(`/training/sessions/${session.id}`);
            }

            router.replace(`/training/sessions`);
        }
    }

    const closeReleaseDialog = () => {
        redirect(releaseDialogOpen || undefined);
        setReleaseDialogOpen(null);
    }

    useEffect(() => {
        getInitialData().then();
    }, [getInitialData])

    if (allLoading) {
        return <CircularProgress/>;
    }

    dayjs.extend(utc);

    return (
        (<LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={!!releaseDialogOpen} onClose={() => closeReleaseDialog()}>
                <DialogTitle>Trainer Release Request Processed</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2,}}>One or more lessons in this session are configured to automatically
                        submit a trainer release request upon passing.</DialogContentText>
                    <DialogContentText><b>Inform the student that a trainer release request has been
                        submitted.</b></DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeReleaseDialog} variant="contained" size="small">OK</Button>
                </DialogActions>
            </Dialog>
            <form action={handleSubmit}>
                <Grid2 container columns={2} spacing={2}>
                    <Grid2 size={2}>
                        <Autocomplete
                            disabled={!!trainingSession}
                            options={allUsers}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                            value={allUsers.find((u) => u.id === student) || null}
                            onChange={(event, newValue) => {
                                setStudent(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => <TextField {...params} label="Student"/>}
                        />
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} label="Start" value={dayjs.utc(start)}
                                        onChange={(d) => setStart(d?.toDate() || new Date())}/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} label="End" value={dayjs.utc(end)}
                                        onChange={(d) => setEnd(d?.toDate() || new Date())}/>
                    </Grid2>
                    <Grid2 size={2}>
                        {trainingTickets.length > 0 && <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" sx={{mb: 2,}}>Training Ticket(s)</Typography>
                                {trainingTickets.map((ticket, index) => (
                                    <Accordion key={index}>
                                        <AccordionSummary expandIcon={<ExpandMore/>}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography>{ticket.lesson.identifier} - {ticket.lesson.name}</Typography>
                                                <IconButton
                                                    onClick={() => setTrainingTickets(trainingTickets.filter((tt, i) => i !== index))}>
                                                    <Delete/>
                                                </IconButton>
                                                <Chip label={ticket.passed ? 'PASS' : 'FAIL'}
                                                      color={ticket.passed ? 'success' : 'error'}/>
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TrainingTicketForm allLessons={allLessons}
                                                                allCommonMistakes={allCommonMistakes}
                                                                lesson={ticket.lesson} mistakes={ticket.mistakes}
                                                                scores={ticket.scores}
                                                                onSubmit={(lesson, mistakes, scores) => {
                                                                    setTrainingTickets((prev) => {
                                                                        return prev.map((t, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    passed: scores.every((score) => score.passed),
                                                                                    lesson,
                                                                                    mistakes,
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
                    </Grid2>
                    <Grid2 size={2}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" sx={{mb: 2,}}>New Training Ticket</Typography>
                                <TrainingTicketForm allLessons={allLessons} allCommonMistakes={allCommonMistakes}
                                                    onSubmit={(lesson, mistakes, scores) => {
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
                                                                    mistakes,
                                                                    scores,
                                                                },
                                                            ];
                                                        });
                                                        toast('Ticket saved', {type: 'success'});
                                                        return true;
                                                    }}/>
                            </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 size={2}>
                        <Accordion variant="outlined">
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography variant="h6">Performance Indicator</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Alert severity="info" sx={{mb: 2,}}>Performance indicators have no impact on the
                                    outcome of each lesson. They&apos;re only purpose is for the trainee and
                                    trainer&apos;s
                                    reference. Comments should be short and concise.</Alert>
                                {trainingSession && !agreeEditPerformanceIndicator &&
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
                                {trainingTickets.length > 0 && (!trainingSession || agreeEditPerformanceIndicator) &&
                                    <TrainingSessionPerformanceIndicatorForm lesson={trainingTickets[0].lesson}
                                                                             onChange={setPerformanceIndicator}/>}
                            </AccordionDetails>
                        </Accordion>
                    </Grid2>
                    <Grid2 size={2}>
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
                    </Grid2>
                    <Grid2 size={2}>
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
                    </Grid2>
                    <Grid2 size={2}>
                        <FormSaveButton/>
                    </Grid2>
                </Grid2>
            </form>
        </LocalizationProvider>)
    );

}