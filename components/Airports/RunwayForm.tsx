'use client';

import React from 'react';
import {Runway} from "@/generated/prisma/browser";
import {Box, Stack, TextField} from "@mui/material";
import {toast} from "react-toastify";
import {upsertRunway} from "@/actions/airports";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function RunwayForm({runway, airportId}: { runway?: Runway, airportId: string, }) {

    const handleSubmit = async (formData: FormData) => {

        const {runway: savedRunway, errors} = await upsertRunway(formData);

        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'})
            return;
        }

        toast(`Runway '${savedRunway.name}' saved successfully!`, {type: 'success'});

    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={runway?.id}/>
            <input type="hidden" name="airportId" value={airportId}/>
            <Stack direction="column" spacing={2}>
                <TextField fullWidth variant="filled" label="Identifier" name="name" defaultValue={runway?.name || ''}/>
                <Box>
                    <FormSaveButton />
                </Box>
            </Stack>
        </form>
    );
}