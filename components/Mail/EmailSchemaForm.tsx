'use client';
import React from 'react';
import {Grid, TextField, Typography} from "@mui/material";
import {DatePicker, DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Dayjs} from "dayjs";
import MarkdownEditor from "@uiw/react-markdown-editor";

interface SchemaProp {
    type?: string;
    title?: string;
    format?: string;
}

export interface EmailTemplateSchema {
    type?: string;
    required?: string[];
    properties?: Record<string, SchemaProp>;
}

export type EmailPayload = Record<string, string>;

function prettyLabel(key: string, title?: string): string {
    if (title) return title;
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Date/date-time field: owns its dayjs value and writes a human-readable string
 *  to the payload (osmium interpolates the string straight into the email). */
function DateField({label, required, withTime, onChange}: {
    label: string;
    required: boolean;
    withTime: boolean;
    onChange: (formatted: string) => void;
}) {
    const [val, setVal] = React.useState<Dayjs | null>(null);
    const handle = (v: Dayjs | null) => {
        setVal(v);
        onChange(v && v.isValid() ? v.format(withTime ? 'MMMM D, YYYY HH:mm [Zulu]' : 'MMMM D, YYYY') : '');
    };
    const slotProps = {textField: {fullWidth: true, required, variant: 'filled' as const}};
    return withTime
        ? <DateTimePicker label={label} ampm={false} value={val} onChange={handle} slotProps={slotProps}/>
        : <DatePicker label={label} value={val} onChange={handle} slotProps={slotProps}/>;
}

/**
 * Renders a reactive form from an email template's JSON-schema `required_payload_schema`.
 * Widget per property is chosen from its `format` hint (markdown / multiline / date /
 * date-time / uri / email → picker/editor, else a text field). Emits the assembled
 * string payload. Re-mount (via a `key` on the template id) to reset field state.
 */
export default function EmailSchemaForm({schema, value, onChange}: {
    schema: EmailTemplateSchema;
    value: EmailPayload;
    onChange: (next: EmailPayload) => void;
}) {
    const properties = schema.properties ?? {};
    const required = new Set(schema.required ?? []);
    const keys = Object.keys(properties);

    const setField = (k: string, v: string) => {
        const next = {...value};
        if (v === '') {
            delete next[k];
        } else {
            next[k] = v;
        }
        onChange(next);
    };

    if (keys.length === 0) {
        return <Typography variant="body2" color="text.secondary">This template needs no additional input.</Typography>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
                {keys.map((key) => {
                    const p = properties[key];
                    const label = prettyLabel(key, p.title);
                    const req = required.has(key);
                    const fmt = p.format;

                    if (fmt === 'markdown') {
                        return (
                            <Grid size={12} key={key}>
                                <Typography variant="body2" sx={{mb: 0.5}}>{label}{req && ' *'}</Typography>
                                <MarkdownEditor
                                    value={value[key] ?? ''}
                                    onChange={(v?: string) => setField(key, v ?? '')}
                                    enableScroll={false}
                                    minHeight="220px"
                                />
                            </Grid>
                        );
                    }

                    if (fmt === 'date' || fmt === 'date-time') {
                        return (
                            <Grid size={{xs: 12, sm: 6}} key={key}>
                                <DateField label={label} required={req} withTime={fmt === 'date-time'}
                                           onChange={(s) => setField(key, s)}/>
                            </Grid>
                        );
                    }

                    const multiline = fmt === 'multiline';
                    return (
                        <Grid size={multiline ? 12 : {xs: 12, sm: 6}} key={key}>
                            <TextField
                                fullWidth
                                variant="filled"
                                label={label}
                                required={req}
                                type={fmt === 'uri' ? 'url' : fmt === 'email' ? 'email' : 'text'}
                                multiline={multiline}
                                minRows={multiline ? 3 : undefined}
                                value={value[key] ?? ''}
                                onChange={(e) => setField(key, e.target.value)}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </LocalizationProvider>
    );
}
