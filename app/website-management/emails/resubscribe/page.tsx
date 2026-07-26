'use client';
import React, {useState} from 'react';
import {Card, CardContent, Stack, TextField, Typography} from "@mui/material";
import {toast} from "react-toastify";
import {useResubscribeEmail} from "@/lib/osmium/hooks/emails";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function Page() {
    const resubscribe = useResubscribeEmail();
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = async (formData: FormData) => {
        const emailValue = (formData.get('email') as string || '').trim();
        const categoryValue = (formData.get('category') as string || '').trim();

        if (!emailValue || !categoryValue) {
            toast('Email and category are required.', {type: 'error'});
            return;
        }

        try {
            await resubscribe.mutateAsync({email: emailValue, category: categoryValue});
            toast(`${emailValue} resubscribed to '${categoryValue}'.`, {type: 'success'});
            setEmail('');
            setCategory('');
        } catch {
            toast('Failed to resubscribe. Check the email and category are correct.', {type: 'error'});
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Resubscribe</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>
                    Lift a suppression so a previously-unsubscribed address receives a non-transactional
                    category again.
                </Typography>
                <form action={handleSubmit}>
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth required variant="filled" label="Email" name="email" value={email}
                                   onChange={(e) => setEmail(e.target.value)}/>
                        <TextField fullWidth required variant="filled" label="Category" name="category"
                                   value={category} onChange={(e) => setCategory(e.target.value)}
                                   helperText="e.g. event_notifications"/>
                        <FormSaveButton text="Resubscribe"/>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
}
