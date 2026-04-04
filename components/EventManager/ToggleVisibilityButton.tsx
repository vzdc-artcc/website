'use client';

import { toggleEventHidden } from "@/actions/eventManagement";
import { Button } from "@mui/material";
import {Event} from "@/generated/prisma/browser";

export default function ToggleVisibilityButton({ event }: { event: Event, }) {
    return (
        <Button variant={event.hidden ? 'contained' : 'outlined'} color={event.hidden ? 'success' : 'error'} onClick={() => toggleEventHidden(event)} disabled={!!event.archived}>{event.hidden ? 'Show' : 'Hide' }</Button>
    );
}