'use client';
import React from 'react';
import {Box, FormControlLabel, FormGroup, Grid, MenuItem, Switch, TextField, Typography, useTheme} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useRouter} from 'next/navigation';
import {useCreateTrainingLesson, useUpdateTrainingLesson} from "@/lib/osmium/hooks/training";

interface LessonLike {
    id: string;
    identifier: string;
    location: number;
    name: string;
    description: string;
    position: string;
    facility: string;
    duration: number;
    trainee_preparation?: string | null;
    instructor_only: boolean;
    notify_instructor_on_pass: boolean;
    release_request_on_pass: boolean;
    performance_indicator_template_id?: string | null;
}

export default function LessonForm({lesson}: { lesson?: LessonLike, }) {

    const theme = useTheme();
    const router = useRouter();
    const createLesson = useCreateTrainingLesson();
    const updateLesson = useUpdateTrainingLesson();
    const [description, setDescription] = React.useState<string>(lesson?.description || '')
    const [traineePreparation, setTraineePreparation] = React.useState<string>(lesson?.trainee_preparation || '');

    const handleSubmit = async (formData: FormData) => {
        const body = {
            identifier: formData.get('identifier') as string,
            location: Number(formData.get('location')),
            name: formData.get('name') as string,
            description,
            position: formData.get('position') as string,
            facility: formData.get('facility') as string,
            duration: Number(formData.get('duration')),
            trainee_preparation: traineePreparation || null,
            instructor_only: formData.get('instructorOnly') === 'on',
            notify_instructor_on_pass: formData.get('notifyInstructorOnPass') === 'on',
            release_request_on_pass: formData.get('releaseRequestOnPass') === 'on',
            performance_indicator_template_id: lesson?.performance_indicator_template_id ?? null,
        };

        try {
            if (lesson) {
                await updateLesson.mutateAsync({lessonId: lesson.id, body});
                toast("Lesson saved successfully!", {type: 'success'});
            } else {
                const created = await createLesson.mutateAsync(body);
                toast("Lesson saved successfully!", {type: 'success'});
                router.replace(`/training/lessons/${created!.id}/edit`);
            }
        } catch {
            toast("Failed to save lesson.", {type: 'error'});
        }
    }

    return (
        (<form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="identifier" label="Indentifier"
                               defaultValue={lesson?.identifier || ''} required/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="name" label="Name" defaultValue={lesson?.name || ''}
                               required/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="facility" label="Facility"
                               defaultValue={lesson?.facility || ''} required/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="position" label="Position"
                               defaultValue={lesson?.position || ''} required/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                    }}>
                    <TextField variant="filled" name="duration" type="number" label="Duration (minutes)"
                               defaultValue={lesson?.duration || 0} required helperText="Give an approximation"/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField
                        select
                        label="Location"
                        name="location"
                        required
                        defaultValue={lesson?.location ?? 2}
                        helperText="This is for VATUSA"
                    >
                        <MenuItem value={0}>
                            Classroom
                        </MenuItem>
                        <MenuItem value={1}>
                            Live
                        </MenuItem>
                        <MenuItem value={2}>
                            Sweatbox
                        </MenuItem>
                    </TextField>
                </Grid>
                <Grid size={2}>
                    <FormGroup>
                        <FormControlLabel control={<Switch defaultChecked={lesson?.instructor_only}/>}
                                          name="instructorOnly" label="Mark as VATUSA OTS?"/>
                        <FormControlLabel control={<Switch defaultChecked={lesson?.notify_instructor_on_pass}/>}
                                          name="notifyInstructorOnPass" label="Notify Instructors on PASS?"/>
                        <FormControlLabel control={<Switch defaultChecked={lesson?.release_request_on_pass}/>}
                                          name="releaseRequestOnPass"
                                          label="Submit trainer release request on home controller PASS?"/>
                    </FormGroup>
                </Grid>
                <Grid size={2}>
                    <Box sx={{maxWidth: '700px',}} data-color-mode={theme.palette.mode}>
                        <Typography variant="subtitle1" sx={{mb: 1,}}>Description</Typography>
                        <MarkdownEditor
                            enableScroll={false}
                            minHeight="300px"
                            value={description}
                            onChange={(d) => setDescription(d)}
                        />
                    </Box>
                </Grid>
                <Grid size={2}>
                    <Box sx={{maxWidth: '700px',}} data-color-mode={theme.palette.mode}>
                        <Typography variant="subtitle1" sx={{mb: 1,}}>Trainee Preparation</Typography>
                        <MarkdownEditor
                            enableScroll={false}
                            minHeight="300px"
                            value={traineePreparation}
                            onChange={(d) => setTraineePreparation(d)}
                        />
                    </Box>
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>)
    );

}
