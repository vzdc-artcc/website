import React from 'react';
import {Box, Paper, Typography} from "@mui/material";

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Renders a before/after JSON snapshot panel for an audit row's expanded view. */
export default function StatePanel({label, value}: { label: string; value: unknown }) {
    return (
        <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'background.default', borderRadius: 1}}>
                <Box component="pre"
                     sx={{m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem', fontFamily: MONO}}>
                    {value ? JSON.stringify(value, null, 2) : '—'}
                </Box>
            </Paper>
        </Box>
    );
}
