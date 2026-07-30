'use client';
import React, {useMemo, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Checkbox,
    Chip,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";
import {groupByTopLevelSegment} from "@/lib/osmium/hooks/access";

export default function PermissionsPicker({catalog, selected, onChange, locked, assignable, readOnly = false}: {
    catalog: string[],
    selected: Set<string>,
    onChange: (next: Set<string>) => void,
    locked?: Set<string>,
    /** When provided, only these permissions (plus `locked`) can be toggled —
     * everything else renders disabled with a "not yours to grant" indicator.
     * Omit for an unrestricted actor (e.g. SERVER_ADMIN). */
    assignable?: Set<string>,
    readOnly?: boolean,
}) {
    const lockedSet = locked ?? new Set<string>();
    const [search, setSearch] = useState('');

    const isAssignable = (permission: string) => !assignable || assignable.has(permission);
    const isToggleable = (permission: string) => !readOnly && !lockedSet.has(permission) && isAssignable(permission);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return catalog;
        return catalog.filter((permission) => permission.toLowerCase().includes(term));
    }, [catalog, search]);

    const groups = useMemo(() => groupByTopLevelSegment(filtered), [filtered]);
    const groupNames = Object.keys(groups).sort();

    const toggle = (permission: string, checked: boolean) => {
        if (!isToggleable(permission)) return;
        const next = new Set(selected);
        if (checked) next.add(permission); else next.delete(permission);
        onChange(next);
    };

    const toggleMany = (permissions: string[], checked: boolean) => {
        if (readOnly) return;
        const next = new Set(selected);
        for (const permission of permissions) {
            if (!isToggleable(permission)) continue;
            if (checked) next.add(permission); else next.delete(permission);
        }
        onChange(next);
    };

    const isEffectivelySelected = (permission: string) => selected.has(permission) || lockedSet.has(permission);

    const allChecked = catalog.length > 0 && catalog.every(isEffectivelySelected);
    const anyChecked = catalog.some(isEffectivelySelected);

    return (
        <Box>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center" sx={{mb: 2}}>
                <TextField
                    fullWidth
                    variant="filled"
                    label="Search permissions"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <FormControlLabel
                    sx={{whiteSpace: 'nowrap'}}
                    control={
                        <Checkbox
                            checked={allChecked}
                            indeterminate={!allChecked && anyChecked}
                            disabled={readOnly}
                            onChange={(e) => toggleMany(catalog, e.target.checked)}
                        />
                    }
                    label="Select all"
                />
            </Stack>
            {groupNames.length === 0 && <Typography>No permissions match your search.</Typography>}
            {groupNames.map((group) => {
                const permissions = groups[group].slice().sort();
                const groupChecked = permissions.every(isEffectivelySelected);
                const groupIndeterminate = !groupChecked && permissions.some(isEffectivelySelected);

                return (
                    <Accordion key={group}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <FormControlLabel
                                onClick={(e) => e.stopPropagation()}
                                control={
                                    <Checkbox
                                        checked={groupChecked}
                                        indeterminate={groupIndeterminate}
                                        disabled={readOnly}
                                        onChange={(e) => toggleMany(permissions, e.target.checked)}
                                    />
                                }
                                label={<Typography sx={{fontWeight: 'bold'}}>{group}</Typography>}
                            />
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction="column">
                                {permissions.map((permission) => (
                                    <FormControlLabel
                                        key={permission}
                                        control={
                                            <Checkbox
                                                checked={isEffectivelySelected(permission)}
                                                disabled={!isToggleable(permission)}
                                                onChange={(e) => toggle(permission, e.target.checked)}
                                            />
                                        }
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body2">{permission}</Typography>
                                                {lockedSet.has(permission) &&
                                                    <Chip size="small" label="baseline" color="info"/>}
                                                {!lockedSet.has(permission) && !isAssignable(permission) &&
                                                    <Chip size="small" label="not yours to grant" color="default"/>}
                                            </Stack>
                                        }
                                    />
                                ))}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
}
