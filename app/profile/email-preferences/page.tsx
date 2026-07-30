'use client';
import React, {useEffect, useState} from 'react';
import {
    Alert,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import Link from "next/link";
import {toast} from "react-toastify";
import {useMyEmailPreferences, useUpdateMyEmailPreferences} from "@/lib/osmium/hooks/emails";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function Page() {
    const {data: preferences, isLoading, isError} = useMyEmailPreferences();
    const updatePreferences = useUpdateMyEmailPreferences();

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
                preferences: editable.map((c) => ({
                    category: c.id,
                    subscribed: subscribed[c.id] ?? c.subscribed,
                })),
            });
            toast('Email preferences updated.', {type: 'success'});
        } catch {
            toast('Failed to update email preferences.', {type: 'error'});
        }
    };

    return (
        <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Link href="/profile/overview" style={{color: 'inherit',}}>
                    <Tooltip title="Go Back">
                        <IconButton color="inherit">
                            <ArrowBack fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                </Link>
                <Typography variant="h4">Email Preferences</Typography>
            </Stack>
            <Card>
                <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>
                        Choose which categories of email you want to receive. Account and
                        security-critical mail (Transactional) is always sent and cannot be
                        turned off.
                    </Typography>
                    {isLoading ? (
                        <CircularProgress/>
                    ) : (isError || !preferences) ? (
                        <Alert severity="error">
                            Could not load your email preferences. Please try again later.
                        </Alert>
                    ) : (
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
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
