'use client';

import React, {useState} from 'react';
import {Chip, ChipProps, Tooltip} from '@mui/material';
import ControllerEventInfoDialog, {ControllerEventInfo} from './ControllerEventInfoDialog';

/** "Carson Berget" + "S3" -> "Carson B. - S3". */
function formatControllerLabel(name?: string | null, rating?: string | null): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0] || 'Unknown';
    const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : '';
    const displayName = lastInitial ? `${first} ${lastInitial}` : first;
    return rating ? `${displayName} - ${rating}` : displayName;
}

export default function ControllerChip({name, cid, published, rating, controllerStatus, info}: {
    name?: string | null;
    cid?: number | null;
    published?: boolean;
    rating?: string | null;
    /** `HOME` / `VISITOR` / `NONE` — visitors get the purple (secondary) chip. */
    controllerStatus?: string | null;
    /** Event-position context for the popup; falls back to name/cid only. */
    info?: ControllerEventInfo;
}) {
    const [open, setOpen] = useState(false);
    const isVisitor = controllerStatus === 'VISITOR';
    const color: ChipProps['color'] = isVisitor ? 'secondary' : published ? 'success' : 'default';
    const dialogInfo: ControllerEventInfo = info ?? {userCid: cid, userName: name};

    return (
        <>
            <Tooltip title="View controller info">
                <Chip
                    label={formatControllerLabel(name, rating)}
                    size="small"
                    color={color}
                    sx={{cursor: 'pointer'}}
                    onClick={() => setOpen(true)}
                />
            </Tooltip>
            {open && <ControllerEventInfoDialog open onClose={() => setOpen(false)} info={dialogInfo}/>}
        </>
    );
}
