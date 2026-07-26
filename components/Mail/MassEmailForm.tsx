'use client';
import React, { useMemo, useState } from 'react';
import { Alert, Autocomplete, Button, CircularProgress, Grid, Stack, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useRosterControllers } from "@/lib/osmium/hooks/users";
import { useSendEmail } from "@/lib/osmium/hooks/emails";

type Controller = {
    id: string;
    cid: number;
    name: string;
    rating: string;
    controllerStatus: string;
    roleNames: string[];
    email: string;
};

type Option =
    | { kind: 'group'; group: 'Groups'; name: string; ids: string[] }
    | { kind: 'user'; group: 'Controllers'; name: string; id: string };

function buildGroups(controllers: Controller[]): { name: string; ids: string[] }[] {
    const home = (r: string) => controllers.filter((c) => c.rating === r && c.controllerStatus === 'HOME').map((c) => c.id);
    return [
        { name: 'Home Observers', ids: home('OBS') },
        { name: 'Home S1', ids: home('S1') },
        { name: 'Home S2', ids: home('S2') },
        { name: 'Home S3', ids: home('S3') },
        {
            name: 'Home C1/C3',
            ids: controllers.filter((c) => ['C1', 'C3'].includes(c.rating) && c.controllerStatus === 'HOME').map((c) => c.id),
        },
        { name: 'Instructors', ids: controllers.filter((c) => c.roleNames.includes('INS')).map((c) => c.id) },
        { name: 'Mentors', ids: controllers.filter((c) => c.roleNames.includes('MTR')).map((c) => c.id) },
        { name: 'Visiting Controllers', ids: controllers.filter((c) => c.controllerStatus === 'VISITOR').map((c) => c.id) },
        {
            name: 'All Training Staff',
            ids: controllers.filter((c) => c.roleNames.some((r) => ['INS', 'MTR'].includes(r))).map((c) => c.id),
        },
    ].filter((g) => g.ids.length > 0);
}

export default function MassEmailForm() {
    const { data: roster, isLoading, isError } = useRosterControllers();
    const sendEmail = useSendEmail();

    const [selected, setSelected] = useState<Option[]>([]);
    const [subject, setSubject] = useState('');
    const [replyTo, setReplyTo] = useState('');
    const [body, setBody] = useState('');

    const controllers: Controller[] = useMemo(
        () =>
            (roster?.items ?? [])
                .filter((item) => item.full && item.full.email)
                .map((item) => ({
                    id: item.full!.id,
                    cid: item.basic.cid,
                    name: item.full!.display_name || item.basic.name,
                    rating: item.basic.rating ?? '',
                    controllerStatus: item.full!.controller_status ?? '',
                    roleNames: item.full!.role_names ?? [],
                    email: item.full!.email,
                })),
        [roster],
    );

    const options: Option[] = useMemo(
        () => [
            ...buildGroups(controllers).map((g) => ({ kind: 'group' as const, group: 'Groups' as const, name: g.name, ids: g.ids })),
            ...controllers.map((c) => ({ kind: 'user' as const, group: 'Controllers' as const, name: `${c.name} (${c.cid})`, id: c.id })),
        ],
        [controllers],
    );

    const selectedUserIds = useMemo(() => {
        const ids = selected.flatMap((o) => (o.kind === 'group' ? o.ids : [o.id]));
        return Array.from(new Set(ids));
    }, [selected]);

    const handleSend = async () => {
        if (selectedUserIds.length === 0) {
            toast('Select at least one recipient.', { type: 'error' });
            return;
        }
        if (!subject.trim() || !body.trim() || !replyTo.trim()) {
            toast('Subject, reply-to, and body are required.', { type: 'error' });
            return;
        }

        try {
            const result = await sendEmail.mutateAsync({
                template_id: 'announcements.generic',
                // osmium types `payload` as an opaque object; announcements.generic
                // takes { headline, body_markdown } (see osmium email templates).
                payload: { headline: subject.trim(), body_markdown: body } as unknown as Record<string, never>,
                subject_override: subject.trim(),
                reply_to_address: replyTo.trim(),
                recipients: { users: selectedUserIds },
                dry_run: false,
            });
            toast(
                `Queued — ${result?.resolved_recipients ?? 0} recipient(s), ${result?.suppressed_recipients ?? 0} suppressed.`,
                { type: 'success' },
            );
            setSelected([]);
            setSubject('');
            setBody('');
        } catch (error: unknown) {
            const code = (error as { error?: string } | null)?.error;
            toast(
                code === 'unauthorized'
                    ? 'You are not authorized to send email (requires emails.send.create).'
                    : 'Failed to send email.',
                { type: 'error' },
            );
        }
    };

    if (isLoading) return <CircularProgress />;
    if (isError) return <Alert severity="error">Failed to load controllers.</Alert>;

    return (
        <Grid container columns={2} spacing={2}>
            <Grid size={2}>
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={options}
                    groupBy={(o) => o.group}
                    getOptionLabel={(o) => o.name}
                    value={selected}
                    onChange={(_e, v) => setSelected(v)}
                    renderInput={(params) => <TextField {...params} label="Recipients" variant="outlined" />}
                />
            </Grid>
            <Grid size={{ xs: 2, md: 1 }}>
                <TextField required fullWidth variant="filled" label="Subject" value={subject}
                           onChange={(e) => setSubject(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 2, md: 1 }}>
                <TextField required fullWidth variant="filled" label="Reply To" value={replyTo}
                           onChange={(e) => setReplyTo(e.target.value)} />
            </Grid>
            <Grid size={2}>
                <TextField required fullWidth multiline rows={6} variant="filled"
                           label="Body (Markdown supported)" value={body} onChange={(e) => setBody(e.target.value)} />
            </Grid>
            <Grid size={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button variant="contained" onClick={handleSend} disabled={sendEmail.isPending}>
                        {sendEmail.isPending ? 'Sending…' : `Send to ${selectedUserIds.length} recipient(s)`}
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    );
}
