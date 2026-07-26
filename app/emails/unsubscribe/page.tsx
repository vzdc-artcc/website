'use client';
import React, {useEffect, useState} from 'react';
import {useSearchParams} from "next/navigation";
import {
    Alert,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Stack,
    Typography
} from "@mui/material";
import {toast} from "react-toastify";
import {useEmailPreferences, useUpdateEmailPreferences} from "@/lib/osmium/hooks/emails";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function Page() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const {data: preferences, isLoading, isError} = useEmailPreferences(token);
    const updatePreferences = useUpdateEmailPreferences();

    const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (preferences) {
            const next: Record<string, boolean> = {};
            for (const category of preferences.categories) {
                next[category.id] = category.subscribed;
            }
            setSubscribed(next);
        }
    }, [preferences]);

    const handleSubmit = async () => {
        if (!preferences) return;

        const editable = preferences.categories.filter((c) => c.editable);
        try {
            await updatePreferences.mutateAsync({
                token,
                preferences: editable.map((c) => ({category: c.id, subscribed: subscribed[c.id]})),
            });
            toast('Email preferences updated.', {type: 'success'});
        } catch {
            toast('Failed to update preferences. The link may have expired.', {type: 'error'});
        }
    };

    if (!token) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Email Preferences</Typography>
                    <Alert severity="error">
                        This link is missing its access token — use the unsubscribe link from an email you
                        received.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return <CircularProgress/>;
    }

    if (isError || !preferences) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Email Preferences</Typography>
                    <Alert severity="error">
                        This link is invalid or has expired. Request a fresh unsubscribe link from a recent
                        email.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Email Preferences</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>
                    Managing preferences for <strong>{preferences.email}</strong>.
                </Typography>
                <form action={handleSubmit}>
                    <Stack direction="column" spacing={1} sx={{mb: 2,}}>
                        {preferences.categories.map((category) => (
                            <FormControlLabel
                                key={category.id}
                                control={
                                    <Checkbox
                                        checked={subscribed[category.id] ?? category.subscribed}
                                        disabled={!category.editable}
                                        onChange={(e) => setSubscribed((prev) => ({
                                            ...prev,
                                            [category.id]: e.target.checked,
                                        }))}
                                    />
                                }
                                label={
                                    <Stack>
                                        <Typography>
                                            {category.name}
                                            {category.is_transactional && ' (required)'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {category.description}
                                        </Typography>
                                    </Stack>
                                }
                            />
                        ))}
                    </Stack>
                    <FormSaveButton text="Save Preferences"/>
                </form>
            </CardContent>
        </Card>
    );
}
