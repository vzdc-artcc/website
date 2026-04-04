'use client';
import {toggleManualPositionOpen} from "@/actions/eventPosition";
import {FormControlLabel, Switch} from "@mui/material";
import {Event} from "@/generated/prisma/browser";

export default function ForcePositionsToggleSwitch({ event }: { event: Event }) {
    return (
        <FormControlLabel
            control={
                <Switch
                    checked={event.manualPositionsOpen}
                    disabled={!!event.archived}
                    onChange={async () => toggleManualPositionOpen(event)}
                />
            }
            label="Force Positions Lock Setting? (no auto close)"
        />
    );
}