'use client';

import React, { useState } from 'react';
import { TextField, Button, Box, Grid2, Autocomplete } from '@mui/material';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import { sendAnnouncement } from '@/actions/discord';

const ANNOUNCEMENT_TYPES_OPTIONS_FLAT = [
    // Announcements
    { value: 'general', label: 'General Announcement', group: 'Announcements' },
    { value: 'event', label: 'Event Announcement', group: 'Announcements' },
    { value: 'training', label: 'Training Announcement', group: 'Announcements' },
    { value: 'websystem', label: 'Web System Announcement', group: 'Announcements' },
    { value: 'facility', label: 'Facility Announcement', group: 'Announcements' },
    // Updates
    { value: 'general-update', label: 'General Update', group: 'Updates' },
    { value: 'event-update', label: 'Event Update', group: 'Updates' },
    { value: 'training-update', label: 'Training Update', group: 'Updates' },
    { value: 'websystem-update', label: 'Web System Update', group: 'Updates' },
    { value: 'facility-update', label: 'Facility Update', group: 'Updates' },
    // Event Specifics
    { value: 'event-reminder', label: 'Event Reminder', group: 'Event Specifics' },
    { value: 'event-posting', label: 'Event Posting', group: 'Event Specifics' },
];

const DynamicMarkdownEditor = dynamic(
    () => import('@uiw/react-markdown-editor'),
    { ssr: false }
);


export default function DiscordAnnouncementForm() {
    const { pending } = useFormStatus();

    const [messageTypeOption, setMessageTypeOption] = useState<{ value: string; label: string; group: string } | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const handleSubmit = async (formData: FormData) => {
        toast('Sending announcement...', { type: 'info', autoClose: false, closeButton: false, toastId: 'announcement-toast' });

        formData.set('messageType', messageTypeOption?.value || '');

        formData.set('body', body);

        const result = await sendAnnouncement(
            formData.get('messageType') as string,
            formData.get('title') as string,
            formData.get('body') as string,
        );

        if (result.errors) {
            toast.update('announcement-toast', {
                render: result.errors.map(e => e.message).join('. '),
                type: 'error',
                autoClose: 5000,
                closeButton: true
            });
        } else if (result.ok) {
            toast.update('announcement-toast', {
                render: 'Announcement sent successfully!',
                type: 'success',
                autoClose: 5000,
                closeButton: true
            });
            setMessageTypeOption(null);
            setTitle('');
            setBody('');
            const formElement = document.getElementById('announcement-form') as HTMLFormElement;
            if (formElement) formElement.reset();
        }
    };

    const isFormValid = messageTypeOption?.value && title.trim() !== '' && body.trim() !== '';

    return (
        <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: '8px' }}>
            <form id="announcement-form" action={handleSubmit}>
                <Grid2 container spacing={2} sx={{ mb: 2 }}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            id="announcement-type-autocomplete"
                            options={ANNOUNCEMENT_TYPES_OPTIONS_FLAT}
                            groupBy={(option) => option.group}
                            getOptionLabel={(option) => option.label}
                            onChange={(event, newValue) => {
                                setMessageTypeOption(newValue);
                            }}
                            value={messageTypeOption}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Announcement Type"
                                    variant="filled"
                                    required
                                    name="messageType"
                                    disabled={pending}
                                />
                            )}
                            // Ensure single selection
                            disableClearable={false}
                            disabled={pending}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <TextField
                            required
                            fullWidth
                            variant="filled"
                            name="title"
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={pending}
                        />
                    </Grid2>
                    <Grid2 size={12}>
                        <DynamicMarkdownEditor
                            value={body}
                            onChange={(value: string) => {
                                setBody(value);
                            }}
                            height="250px"
                            enableScroll={false}
                            toolbarBottom={true}
                            readOnly={pending}
                        />
                    </Grid2>
                </Grid2>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={pending || !isFormValid}
                >
                    {pending ? 'Sending...' : 'Send Announcement'}
                </Button>
            </form>
        </Box>
    );
}