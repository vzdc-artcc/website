'use client';
import React, {useRef, useState} from 'react';
import {Checkbox, FormControlLabel, Stack, TextField} from "@mui/material";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDossierEntry} from "@/lib/osmium/hooks/training";

export default function DossierForm({cid}: { cid: number }) {

    const formRef = useRef<HTMLFormElement>(null);
    const [confidential, setConfidential] = useState(false);
    const createEntry = useCreateDossierEntry(cid);

    const handleSubmit = async (formData: FormData) => {
        const message = ((formData.get('message') as string) || '').trim();
        if (!message) {
            toast('Message must be at least 1 character long', {type: 'error'});
            return;
        }
        try {
            await createEntry.mutateAsync({message, confidential});
            toast('Dossier entry added', {type: 'success'});
            formRef.current?.reset();
            setConfidential(false);
        } catch {
            toast('Failed to add dossier entry', {type: 'error'});
        }
    }

    return (
        <form ref={formRef} action={handleSubmit}>
            <Stack direction="row" spacing={1} alignItems="center">
                <TextField variant="filled" fullWidth name="message" label="Message*"/>
                <FormControlLabel control={<Checkbox checked={confidential}
                                                      onChange={(e) => setConfidential(e.target.checked)}/>}
                                   label="Confidential"/>
                <FormSaveButton/>
            </Stack>
        </form>
    );
}
