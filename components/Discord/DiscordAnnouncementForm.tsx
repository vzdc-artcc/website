'use client';

import React, {useState} from 'react';
import {Box, Button, Checkbox, FormControlLabel, Grid, Stack, TextField} from '@mui/material';
import {useFormStatus} from 'react-dom';
import {toast} from 'react-toastify';
import dynamic from 'next/dynamic';
import {useQueueAnnouncement} from '@/lib/osmium/hooks/outbound-jobs';

const DynamicMarkdownEditor = dynamic(
    () => import('@uiw/react-markdown-editor'),
    {ssr: false}
);

export default function DiscordAnnouncementForm() {
    const {pending} = useFormStatus();
    const queueAnnouncement = useQueueAnnouncement();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [detailsUrl, setDetailsUrl] = useState('');
    const [sendDiscord, setSendDiscord] = useState(true);
    const [sendEmail, setSendEmail] = useState(true);

    const handleSubmit = async () => {
        toast('Sending announcement...', {
            type: 'info',
            autoClose: false,
            closeButton: false,
            toastId: 'announcement-toast'
        });

        try {
            await queueAnnouncement.mutateAsync({
                title: title.trim(),
                body_markdown: body,
                details_url: detailsUrl.trim() || undefined,
                send_discord: sendDiscord,
                send_email: sendEmail,
            });
            toast.update('announcement-toast', {
                render: 'Announcement queued successfully!',
                type: 'success',
                autoClose: 5000,
                closeButton: true
            });
            setTitle('');
            setBody('');
            setDetailsUrl('');
        } catch {
            toast.update('announcement-toast', {
                render: 'Failed to queue announcement.',
                type: 'error',
                autoClose: 5000,
                closeButton: true
            });
        }
    };

    const isFormValid = title.trim() !== '' && body.trim() !== '' && (sendDiscord || sendEmail);

    return (
        <Box sx={{p: 3, border: '1px solid #ccc', borderRadius: '8px'}}>
            <form id="announcement-form" action={handleSubmit}>
                <Grid container spacing={2} sx={{mb: 2}}>
                    <Grid size={{xs: 12, md: 6}}>
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
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <TextField
                            fullWidth
                            variant="filled"
                            name="detailsUrl"
                            label="Details URL (optional)"
                            value={detailsUrl}
                            onChange={(e) => setDetailsUrl(e.target.value)}
                            disabled={pending}
                        />
                    </Grid>
                    <Grid size={12}>
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
                    </Grid>
                    <Grid size={12}>
                        <Stack direction="row" spacing={2}>
                            <FormControlLabel
                                control={<Checkbox checked={sendDiscord} disabled={pending}
                                                    onChange={(e) => setSendDiscord(e.target.checked)}/>}
                                label="Send to Discord"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={sendEmail} disabled={pending}
                                                    onChange={(e) => setSendEmail(e.target.checked)}/>}
                                label="Send Email"
                            />
                        </Stack>
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={pending || queueAnnouncement.isPending || !isFormValid}
                >
                    {queueAnnouncement.isPending ? 'Sending...' : 'Send Announcement'}
                </Button>
            </form>
        </Box>
    );
}
