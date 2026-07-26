'use client';

import React from 'react';
import {Chip, Tooltip} from '@mui/material';
import Link from "next/link";

export default function ControllerChip({name, cid, published}: {
    name?: string | null;
    cid?: number | null;
    published?: boolean;
}) {
    const label = `${name || 'Unknown'}${cid ? ` (${cid})` : ''}`;

    return (
        <Tooltip title="View controller profile">
            <Link href={cid ? `/admin/controller/${cid}` : '#'} target="_blank" style={{textDecoration: 'none'}}>
                <Chip label={label} size="small" color={published ? 'success' : 'default'} sx={{cursor: 'pointer'}}/>
            </Link>
        </Tooltip>
    );
}
