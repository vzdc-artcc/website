'use client';
import React from 'react';
import {
    Alert,
    Card,
    CardContent,
    CircularProgress,
    FormControlLabel,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import {toast} from 'react-toastify';
import {useBotFeatures, useUpdateBotFeatures} from '@/lib/osmium/hooks/discord';

export default function Page() {
    const {data, isLoading, isError} = useBotFeatures();
    const update = useUpdateBotFeatures();

    if (isLoading) {
        return <CircularProgress/>;
    }
    if (isError || !data) {
        return <Alert severity="error">Failed to load Discord bot features.</Alert>;
    }

    const onToggle = async (key: string, enabled: boolean) => {
        try {
            await update.mutateAsync({[key]: enabled});
            toast.success(`${enabled ? 'Enabled' : 'Disabled'} ${key}`);
        } catch {
            toast.error('Failed to update feature');
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1}}>Discord Bot Features</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    Enable or disable segments of the Discord bot. Changes apply to the running
                    bot within about a minute (on its next config sync).
                </Typography>
                <Stack>
                    {data.features.map((feature) => (
                        <FormControlLabel
                            key={feature.key}
                            control={
                                <Switch
                                    checked={feature.enabled}
                                    disabled={update.isPending}
                                    onChange={(e) => onToggle(feature.key, e.target.checked)}
                                />
                            }
                            label={feature.label}
                        />
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}
