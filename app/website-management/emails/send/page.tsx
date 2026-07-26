'use client';
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    MenuItem,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {toast} from "react-toastify";
import {useEmailTemplates, usePreviewEmail, useSendEmail} from "@/lib/osmium/hooks/emails";

export default function Page() {
    const {data: templates, isLoading: templatesLoading} = useEmailTemplates();
    const previewEmail = usePreviewEmail();
    const sendEmail = useSendEmail();

    const [templateId, setTemplateId] = useState('');
    const [payloadText, setPayloadText] = useState('{}');
    const [recipientsMode, setRecipientsMode] = useState<'emails' | 'audience'>('emails');
    const [emails, setEmails] = useState('');
    const [roles, setRoles] = useState('');
    const [artcc, setArtcc] = useState('');
    const [rating, setRating] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);
    const [subjectOverride, setSubjectOverride] = useState('');
    const [replyTo, setReplyTo] = useState('');
    const [dryRun, setDryRun] = useState(true);

    const selectedTemplate = templates?.find((t) => t.id === templateId);

    const parsedPayload = () => {
        try {
            return JSON.parse(payloadText);
        } catch {
            toast('Payload must be valid JSON.', {type: 'error'});
            return null;
        }
    };

    const buildRecipients = () => {
        if (recipientsMode === 'emails') {
            const list = emails.split(/[\n,]/).map((e) => e.trim()).filter(Boolean);
            return list.length > 0 ? {recipients: {emails: list}} : {};
        }
        return {
            audience: {
                roles: roles ? roles.split(',').map((r) => r.trim()).filter(Boolean) : undefined,
                artcc: artcc ? artcc.split(',').map((a) => a.trim()).filter(Boolean) : undefined,
                rating: rating ? rating.split(',').map((r) => r.trim()).filter(Boolean) : undefined,
                active_only: activeOnly || undefined,
            },
        };
    };

    const handlePreview = async () => {
        if (!templateId) {
            toast('Select a template first.', {type: 'error'});
            return;
        }
        const payload = parsedPayload();
        if (payload === null) return;

        try {
            await previewEmail.mutateAsync({template_id: templateId, payload});
        } catch {
            toast('Failed to render preview.', {type: 'error'});
        }
    };

    const handleSend = async () => {
        if (!templateId) {
            toast('Select a template first.', {type: 'error'});
            return;
        }
        const payload = parsedPayload();
        if (payload === null) return;

        try {
            const result = await sendEmail.mutateAsync({
                template_id: templateId,
                payload,
                subject_override: subjectOverride || undefined,
                reply_to_address: replyTo || undefined,
                dry_run: dryRun,
                ...buildRecipients(),
            });
            toast(dryRun
                ? `Dry run OK — ${result?.resolved_recipients} recipient(s) would receive this.`
                : `Queued — ${result?.resolved_recipients} recipient(s), ${result?.suppressed_recipients} suppressed.`,
                {type: 'success'});
        } catch {
            toast('Failed to send email.', {type: 'error'});
        }
    };

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>Preview / Send Email</Typography>
                    {templatesLoading && <CircularProgress/>}
                    <Grid container spacing={2}>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField select fullWidth variant="filled" label="Template" value={templateId}
                                       onChange={(e) => setTemplateId(e.target.value)}>
                                {templates?.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.name} ({t.id})</MenuItem>
                                ))}
                            </TextField>
                            {selectedTemplate && (
                                <Typography variant="body2" color="text.secondary" sx={{mt: 1,}}>
                                    {selectedTemplate.description}
                                </Typography>
                            )}
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField fullWidth variant="filled" label="Subject Override" value={subjectOverride}
                                       onChange={(e) => setSubjectOverride(e.target.value)}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline minRows={4} variant="filled" label="Payload (JSON)"
                                       value={payloadText} onChange={(e) => setPayloadText(e.target.value)}
                                       sx={{fontFamily: 'monospace',}}/>
                            {selectedTemplate && (
                                <Typography variant="caption" color="text.secondary" component="pre"
                                            sx={{whiteSpace: 'pre-wrap',}}>
                                    Required schema: {JSON.stringify(selectedTemplate.required_payload_schema)}
                                </Typography>
                            )}
                        </Grid>
                        <Grid size={12}>
                            <ToggleButtonGroup exclusive value={recipientsMode}
                                                onChange={(_e, v) => v && setRecipientsMode(v)} sx={{mb: 2,}}>
                                <ToggleButton value="emails">Explicit Emails</ToggleButton>
                                <ToggleButton value="audience">Audience Filter</ToggleButton>
                            </ToggleButtonGroup>
                            {recipientsMode === 'emails' && (
                                <TextField fullWidth multiline minRows={2} variant="filled"
                                           label="Recipient Emails (comma or newline separated)" value={emails}
                                           onChange={(e) => setEmails(e.target.value)}/>
                            )}
                            {recipientsMode === 'audience' && (
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 12, sm: 4}}>
                                        <TextField fullWidth variant="filled" label="Roles (comma separated)"
                                                   value={roles} onChange={(e) => setRoles(e.target.value)}/>
                                    </Grid>
                                    <Grid size={{xs: 12, sm: 4}}>
                                        <TextField fullWidth variant="filled" label="ARTCC (comma separated)"
                                                   value={artcc} onChange={(e) => setArtcc(e.target.value)}/>
                                    </Grid>
                                    <Grid size={{xs: 12, sm: 4}}>
                                        <TextField fullWidth variant="filled" label="Rating (comma separated)"
                                                   value={rating} onChange={(e) => setRating(e.target.value)}/>
                                    </Grid>
                                    <Grid size={12}>
                                        <FormControlLabel
                                            control={<Checkbox checked={activeOnly}
                                                                onChange={(e) => setActiveOnly(e.target.checked)}/>}
                                            label="Active controllers only"/>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField fullWidth variant="filled" label="Reply-To Address" value={replyTo}
                                       onChange={(e) => setReplyTo(e.target.value)}/>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}} sx={{display: 'flex', alignItems: 'center',}}>
                            <FormControlLabel
                                control={<Checkbox checked={dryRun} onChange={(e) => setDryRun(e.target.checked)}/>}
                                label="Dry run (validate only, don't queue)"/>
                        </Grid>
                    </Grid>
                    <Stack direction="row" spacing={2} sx={{mt: 2,}}>
                        <Button variant="outlined" onClick={handlePreview} disabled={previewEmail.isPending}>
                            Preview
                        </Button>
                        <Button variant="contained" onClick={handleSend} disabled={sendEmail.isPending}>
                            {dryRun ? 'Validate' : 'Send'}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {previewEmail.isError && (
                <Alert severity="error">Failed to render preview — check the template ID and payload.</Alert>
            )}

            {previewEmail.data && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Preview</Typography>
                        <Typography variant="subtitle1" sx={{mb: 1,}}>Subject: {previewEmail.data.subject}</Typography>
                        <Divider sx={{mb: 2,}}/>
                        <Box sx={{border: '1px solid', borderColor: 'divider', p: 2, mb: 2,}}
                             dangerouslySetInnerHTML={{__html: previewEmail.data.html}}/>
                        <Typography variant="subtitle2">Plain Text</Typography>
                        <Typography component="pre" variant="body2" sx={{whiteSpace: 'pre-wrap',}}>
                            {previewEmail.data.text}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Stack>
    );
}
