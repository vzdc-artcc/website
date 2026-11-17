import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {diffSnapshots} from "@/lib/auditDiff";
import {MONO} from "@/components/Logs/StatePanel";

function formatValue(value: unknown): string {
    if (value === undefined) return '—';
    return typeof value === 'string' ? value : JSON.stringify(value);
}

/** Field / Before / After for only the fields an audited action changed. */
export default function AuditDiffTable({before, after}: { before: unknown, after: unknown }) {
    const changes = diffSnapshots(before, after);

    if (changes.length === 0) {
        return <Typography variant="body2" color="text.secondary">No field changes recorded.</Typography>;
    }

    const cell = {fontFamily: MONO, fontSize: '0.75rem', wordBreak: 'break-word', verticalAlign: 'top'} as const;

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Before</TableCell>
                    <TableCell>After</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {changes.map((change) => (
                    <TableRow key={change.path}>
                        <TableCell sx={{...cell, fontWeight: 600}}>{change.path}</TableCell>
                        <TableCell sx={{...cell, color: 'error.main'}}>{formatValue(change.before)}</TableCell>
                        <TableCell sx={{...cell, color: 'success.main'}}>{formatValue(change.after)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
