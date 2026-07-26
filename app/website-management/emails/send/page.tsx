'use client';
import React, {useEffect, useMemo, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Collapse,
    Divider,
    FormControlLabel,
    Grid,
    Link as MuiLink,
    MenuItem,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {toast} from "react-toastify";
import {useEmailTemplates, usePreviewEmail, useSendEmail} from "@/lib/osmium/hooks/emails";
import EmailSchemaForm, {EmailPayload, EmailTemplateSchema} from "@/components/Mail/EmailSchemaForm";

export default function Page() {
    const {data: templates, isLoading: templatesLoading} = useEmailTemplates();
    const previewEmail = usePreviewEmail();
    const sendEmail = useSendEmail();

    const [templateId, setTemplateId] = useState('');
    const [payload, setPayload] = useState<EmailPayload>({});
    const [recipientsMode, setRecipientsMode] = useState<'emails' | 'audience'>('emails');
    const [emails, setEmails] = useState('');
    const [roles, setRoles] = useState('');
    const [artcc, setArtcc] = useState('');
    const [rating, setRating] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);
    const [subjectOverride, setSubjectOverride] = useState('');
    const [replyTo, setReplyTo] = useState('');
    const [dryRun, setDryRun] = useState(true);

    const [showRaw, setShowRaw] = useState(false);
    const [rawText, setRawText] = useState('{}');

    const selectedTemplate = templates?.find((t) => t.id === templateId);
    const schema = (selectedTemplate?.required_payload_schema ?? {}) as EmailTemplateSchema;

    const missingRequired = useMemo(() => {
        const req = schema.required ?? [];
        return req.filter((k) => !(payload[k] && payload[k].trim()));
    }, [schema, payload]);

    const canPreview = !!templateId && missingRequired.length === 0;

    // Live, debounced preview — re-renders as the form changes once required fields are filled.
    useEffect(() => {
        if (!canPreview) return;
        const handle = setTimeout(() => {
            previewEmail.mutate({template_id: templateId, payload: payload as Record<string, never>});
        }, 450);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId, JSON.stringify(payload), canPreview]);

    const onSelectTemplate = (id: string) => {
        setTemplateId(id);
        setPayload({});
    };

    // Seed the raw-JSON editor from the current payload when it's opened or template changes.
    useEffect(() => {
        if (showRaw) setRawText(JSON.stringify(payload, null, 2));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showRaw, templateId]);

    const applyRaw = () => {
        try {
            const parsed = JSON.parse(rawText);
            setPayload(parsed);
            toast.success('Applied JSON to the form.');
        } catch {
            toast.error('That is not valid JSON.');
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

    const handleSend = async () => {
        if (!templateId) {
            toast('Select a template first.', {type: 'error'});
            return;
        }
        if (missingRequired.length > 0) {
            toast(`Fill in the required field(s): ${missingRequired.join(', ')}`, {type: 'error'});
            return;
        }
        const recips = buildRecipients() as { recipients?: { emails?: string[] }, audience?: Record<string, unknown> };
        const hasRecipients = !!(recips.recipients?.emails?.length
            || (recips.audience && Object.values(recips.audience).some((v) => v !== undefined)));
        if (!hasRecipients) {
            toast('Add at least one recipient — an email address or an audience filter.', {type: 'error'});
            return;
        }
        try {
            const result = await sendEmail.mutateAsync({
                template_id: templateId,
                payload: payload as Record<string, never>,
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
            <Typography variant="h5" fontWeight={700}>Preview / Send Email</Typography>
            <Typography variant="body2" color="text.secondary">Compose, preview, and send a one-off email from any template.</Typography>
            <Grid container columns={12} spacing={2}>
                {/* ---- Left: builder ---- */}
                <Grid size={{xs: 12, md: 6}}>
                    <Card>
                        <CardContent>
                            <Stack direction="column" spacing={2}>
                                {templatesLoading && <CircularProgress/>}
                                <TextField select fullWidth variant="filled" label="Template" value={templateId}
                                           onChange={(e) => onSelectTemplate(e.target.value)}>
                                    {templates?.map((t) => (
                                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                    ))}
                                </TextField>
                                {selectedTemplate && (
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedTemplate.description}
                                    </Typography>
                                )}

                                {templateId && (
                                    <>
                                        <Divider textAlign="left">
                                            <Typography variant="overline" color="text.secondary">Content</Typography>
                                        </Divider>
                                        <EmailSchemaForm key={templateId} schema={schema} value={payload}
                                                         onChange={setPayload}/>
                                        <TextField fullWidth variant="filled" label="Subject Override (optional)"
                                                   value={subjectOverride}
                                                   onChange={(e) => setSubjectOverride(e.target.value)}/>

                                        <Box>
                                            <MuiLink component="button" type="button" variant="body2"
                                                     onClick={() => setShowRaw((s) => !s)}>
                                                {showRaw ? 'Hide' : 'Advanced:'} raw JSON payload
                                            </MuiLink>
                                            <Collapse in={showRaw}>
                                                <TextField fullWidth multiline minRows={4} variant="filled"
                                                           label="Payload (JSON)" value={rawText}
                                                           sx={{mt: 1, fontFamily: 'monospace'}}
                                                           onChange={(e) => setRawText(e.target.value)}/>
                                                <Button size="small" onClick={applyRaw} sx={{mt: 1}}>Apply JSON to form</Button>
                                            </Collapse>
                                        </Box>

                                        <Divider textAlign="left">
                                            <Typography variant="overline" color="text.secondary">Delivery</Typography>
                                        </Divider>
                                        <ToggleButtonGroup exclusive size="small" value={recipientsMode}
                                                           onChange={(_e, v) => v && setRecipientsMode(v)}>
                                            <ToggleButton value="emails">Explicit Emails</ToggleButton>
                                            <ToggleButton value="audience">Audience Filter</ToggleButton>
                                        </ToggleButtonGroup>
                                        {recipientsMode === 'emails' ? (
                                            <TextField fullWidth multiline minRows={2} variant="filled"
                                                       label="Recipient Emails (comma or newline separated)"
                                                       value={emails} onChange={(e) => setEmails(e.target.value)}/>
                                        ) : (
                                            <Grid container spacing={2}>
                                                <Grid size={{xs: 12, sm: 4}}>
                                                    <TextField fullWidth variant="filled" label="Roles" value={roles}
                                                               onChange={(e) => setRoles(e.target.value)}/>
                                                </Grid>
                                                <Grid size={{xs: 12, sm: 4}}>
                                                    <TextField fullWidth variant="filled" label="ARTCC" value={artcc}
                                                               onChange={(e) => setArtcc(e.target.value)}/>
                                                </Grid>
                                                <Grid size={{xs: 12, sm: 4}}>
                                                    <TextField fullWidth variant="filled" label="Rating" value={rating}
                                                               onChange={(e) => setRating(e.target.value)}/>
                                                </Grid>
                                                <Grid size={12}>
                                                    <FormControlLabel control={<Checkbox checked={activeOnly}
                                                                                         onChange={(e) => setActiveOnly(e.target.checked)}/>}
                                                                      label="Active controllers only"/>
                                                </Grid>
                                            </Grid>
                                        )}
                                        <TextField fullWidth variant="filled" label="Reply-To Address (optional)"
                                                   value={replyTo} onChange={(e) => setReplyTo(e.target.value)}/>
                                        <FormControlLabel
                                            control={<Checkbox checked={dryRun} onChange={(e) => setDryRun(e.target.checked)}/>}
                                            label="Dry run (validate only, don't queue)"/>
                                        <Box>
                                            <Button variant="contained" onClick={handleSend}
                                                    disabled={sendEmail.isPending || missingRequired.length > 0}>
                                                {dryRun ? 'Validate' : 'Send'}
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ---- Right: live preview ---- */}
                <Grid size={{xs: 12, md: 6}}>
                    <Card sx={{position: {md: 'sticky'}, top: {md: 16}}}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Live Preview</Typography>
                            {!templateId && <Typography variant="body2" color="text.secondary">Select a template to begin.</Typography>}
                            {templateId && missingRequired.length > 0 && (
                                <Alert severity="info">Fill in the required field(s) to see a preview: <strong>{missingRequired.join(', ')}</strong></Alert>
                            )}
                            {canPreview && previewEmail.isPending && !previewEmail.data && (
                                <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}><CircularProgress/></Box>
                            )}
                            {canPreview && previewEmail.isError && (
                                <Alert severity="error">Failed to render preview.</Alert>
                            )}
                            {canPreview && previewEmail.data && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                                    <Typography variant="subtitle1" sx={{mb: 1}}>{previewEmail.data.subject}</Typography>
                                    <Divider sx={{mb: 2}}/>
                                    {/* Sandboxed iframe so the email's own <style>/body rules stay
                                        isolated and don't leak into the app (e.g. repainting the
                                        page background white and breaking dark mode). */}
                                    <Box sx={{border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden'}}>
                                        <iframe
                                            title="Email preview"
                                            srcDoc={previewEmail.data.html}
                                            onLoad={(e) => {
                                                const h = e.currentTarget.contentDocument?.documentElement?.scrollHeight;
                                                if (h) e.currentTarget.style.height = `${h}px`;
                                            }}
                                            style={{width: '100%', minHeight: 320, border: 0, display: 'block', background: '#fff'}}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Stack>
    );
}
