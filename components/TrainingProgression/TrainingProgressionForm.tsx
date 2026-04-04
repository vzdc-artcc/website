'use client';
import React, {useState} from 'react';
import {TrainingProgression} from "@/generated/prisma/browser";
import Form from "next/form";
import {Autocomplete, Box, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateTrainingProgression} from "@/actions/trainingProgression";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function TrainingProgressionForm({trainingProgression, allProgressions}: {
    trainingProgression?: TrainingProgression,
    allProgressions: TrainingProgression[]
}) {

    const router = useRouter();
    const [nextProgression, setNextProgression] = useState<TrainingProgression | null>(allProgressions.find(p => p.id === trainingProgression?.nextProgressionId) || null);

    const handleSubmit = async (formData: FormData) => {

        formData.set('nextProgressionId', nextProgression?.id || '');

        const {trainingProgression: newTp, errors} = await createOrUpdateTrainingProgression(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('. '));
            return;
        }

        toast.success(trainingProgression?.id ? "Training progression updated!" : "Training progression created!");
        if (!trainingProgression?.id) {
            router.push(`/training/progressions/${newTp.id}/edit/steps`);
        }
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <input type="hidden" name="id" defaultValue={trainingProgression?.id || ''}/>
                <TextField variant="filled" label="Name" name="name" fullWidth required
                           defaultValue={trainingProgression?.name || ''}/>
                <FormControlLabel name="autoAssignNewHomeObs"
                                  control={<Switch defaultChecked={trainingProgression?.autoAssignNewHomeObs}/>}
                                  label="Auto assign to NEW HOME OBS?"/>
                <FormControlLabel name="autoAssignNewVisitor"
                                  control={<Switch defaultChecked={trainingProgression?.autoAssignNewVisitor}/>}
                                  label="Auto assign to NEW VISITOR?"/>
                <Autocomplete
                    options={allProgressions.filter(p => p.id !== trainingProgression?.id)}
                    getOptionLabel={(option) => option.name}
                    value={nextProgression}
                    onChange={(event, newValue) => {
                        setNextProgression(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Next Progression (optional)"
                                                        placeholder="Search by name"
                                                        helperText="This progression will be autoassigned if the current progression has been completed (including optionals or when a student forces the progression to complete after finishing all steps). "/>}
                />
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>

        </Form>
    );
}

