'use client';
import React, {useState} from 'react';
import Form from "next/form";
import {Autocomplete, Box, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {
    useCreateTrainingProgression,
    useTrainingProgressions,
    useUpdateTrainingProgression
} from "@/lib/osmium/hooks/training";

interface ProgressionLike {
    id: string;
    name: string;
    next_progression_id?: string | null;
    auto_assign_new_home_obs: boolean;
    auto_assign_new_visitor: boolean;
}

export default function TrainingProgressionForm({trainingProgression}: {
    trainingProgression?: ProgressionLike,
}) {

    const router = useRouter();
    const {data} = useTrainingProgressions();
    const allProgressions = data?.items ?? [];
    const createProgression = useCreateTrainingProgression();
    const updateProgression = useUpdateTrainingProgression();
    const [nextProgression, setNextProgression] = useState<ProgressionLike | null>(
        allProgressions.find(p => p.id === trainingProgression?.next_progression_id) || null
    );

    const handleSubmit = async (formData: FormData) => {
        const body = {
            name: formData.get('name') as string,
            next_progression_id: nextProgression?.id || null,
            auto_assign_new_home_obs: formData.get('autoAssignNewHomeObs') === 'on',
            auto_assign_new_visitor: formData.get('autoAssignNewVisitor') === 'on',
        };

        try {
            if (trainingProgression) {
                await updateProgression.mutateAsync({progressionId: trainingProgression.id, body});
                toast.success("Training progression updated!");
            } else {
                const created = await createProgression.mutateAsync(body);
                toast.success("Training progression created!");
                router.push(`/training/progressions/${created!.id}/edit/steps`);
            }
        } catch {
            toast.error("Failed to save training progression.");
        }
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField variant="filled" label="Name" name="name" fullWidth required
                           defaultValue={trainingProgression?.name || ''}/>
                <FormControlLabel name="autoAssignNewHomeObs"
                                  control={<Switch defaultChecked={trainingProgression?.auto_assign_new_home_obs}/>}
                                  label="Auto assign to NEW HOME OBS?"/>
                <FormControlLabel name="autoAssignNewVisitor"
                                  control={<Switch defaultChecked={trainingProgression?.auto_assign_new_visitor}/>}
                                  label="Auto assign to NEW VISITOR?"/>
                <Autocomplete
                    options={allProgressions.filter(p => p.id !== trainingProgression?.id)}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
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
