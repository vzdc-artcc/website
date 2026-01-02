'use client';
import React from 'react';
import {Lesson} from "@prisma/client";
import {
    Box,
    FormControlLabel,
    FormGroup,
    Grid2,
    MenuItem,
    Switch,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {createOrUpdateLessonDetails} from "@/actions/lesson";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useRouter} from 'next/navigation';

export default function LessonForm({lesson}: { lesson?: Lesson, }) {

    const theme = useTheme();
    const router = useRouter();
    const [description, setDescription] = React.useState<string>(lesson?.description || '')
    const [traineePreparation, setTraineePreparation] = React.useState<string>(lesson?.traineePreparation || '');

    const handleSubmit = async (formData: FormData) => {
        const {id, error,} = await createOrUpdateLessonDetails(formData);

        if (error) {
            toast(error.errors.map((e) => e.message).join(".  "), {type: 'error'});
            return;
        }

        if (!lesson?.id) {
            router.replace(`/training/lessons/${id}/edit`);
        }
        toast("Lesson saved successfully!", {type: 'success'});
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="lessonId" value={lesson?.id || ''}/>
            <input type="hidden" name="description" value={description}/>
            <input type="hidden" name="traineePreparation" value={traineePreparation}/>
            <Grid2 container columns={2} spacing={2}>
                <Grid2
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="identifier" label="Indentifier"
                               defaultValue={lesson?.identifier || ''} required/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="name" label="Name" defaultValue={lesson?.name || ''}
                               required/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="facility" label="Facility"
                               defaultValue={lesson?.facility || ''} required/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" name="position" label="Position"
                               defaultValue={lesson?.position || ''} required/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                    }}>
                    <TextField variant="filled" name="duration" type="number" label="Duration (minutes)"
                               defaultValue={lesson?.duration || 0} required helperText="Give an approximation"/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField
                        select
                        label="Location"
                        name="location"
                        required
                        defaultValue={lesson?.location || 2}
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
                </Grid2>
                <Grid2 size={2}>
                    <FormGroup>
                        <FormControlLabel control={<Switch defaultChecked={lesson?.instructorOnly}/>}
                                          name="instructorOnly" label="Mark as VATUSA OTS?"/>
                        <FormControlLabel control={<Switch defaultChecked={lesson?.notifyInstructorOnPass}/>}
                                          name="notifyInstructorOnPass" label="Notify Instructors on PASS?"/>
                        <FormControlLabel control={<Switch defaultChecked={lesson?.releaseRequestOnPass}/>}
                                          name="releaseRequestOnPass"
                                          label="Submit trainer release request on home controller PASS?"/>
                    </FormGroup>
                </Grid2>
                <Grid2 size={2}>
                    <Box sx={{maxWidth: '700px',}} data-color-mode={theme.palette.mode}>
                        <Typography variant="subtitle1" sx={{mb: 1,}}>Description</Typography>
                        <MarkdownEditor
                            enableScroll={false}
                            minHeight="300px"
                            value={description}
                            onChange={(d) => setDescription(d)}
                        />
                    </Box>
                </Grid2>
                <Grid2 size={2}>
                    <Box sx={{maxWidth: '700px',}} data-color-mode={theme.palette.mode}>
                        <Typography variant="subtitle1" sx={{mb: 1,}}>Trainee Preparation</Typography>
                        <MarkdownEditor
                            enableScroll={false}
                            minHeight="300px"
                            value={traineePreparation}
                            onChange={(d) => setTraineePreparation(d)}
                        />
                    </Box>
                </Grid2>
                <Grid2 size={2}>
                    <FormSaveButton/>
                </Grid2>
            </Grid2>
        </form>)
    );

}