'use client';
import React, {useState} from 'react';
import {User} from "next-auth";
import Form from "next/form";
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {Add} from "@mui/icons-material";
import {toast} from "react-toastify";

export default function TrainingAppointmentAdditionalTrainerForm({allTrainers, onSubmit}: {
    allTrainers: User[],
    onSubmit: (trainerId: string, description: string,) => void,
}) {

    const [trainerId, setTrainerId] = useState<string>();

    const handleSubmit = (formData: FormData) => {
        const description = formData.get('description');

        if (!trainerId || !description || !allTrainers.map((t) => t.id).includes(trainerId)) {
            toast.error("Invalid");
            return;
        }

        onSubmit(trainerId, description.toString().toUpperCase());
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" alignItems="flex-end" spacing={2}>
                <Autocomplete
                    fullWidth
                    options={allTrainers}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.operatingInitials})`}
                    value={allTrainers.find((t) => t.id === trainerId) || null}
                    onChange={(_e, value) => {
                        setTrainerId(value?.id);
                    }}
                    renderInput={(params) => <TextField {...params} required variant="outlined" label="Trainer"
                                                        name="trainerId"/>}
                />
                <TextField fullWidth variant="outlined" label="Description" required name="description"
                           placeholder="What will this trainer do (commands, voices, mentor training, etc.)?"
                           helperText="The additional trainer will see this information along with the appointment."/>
                <Box>
                    <FormSaveButton text="Add" icon={<Add/>} size="small"/>
                </Box>
            </Stack>
        </Form>
    );

}