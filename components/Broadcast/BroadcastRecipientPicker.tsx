'use client';
import React from 'react';
import {Autocomplete, TextField} from "@mui/material";

interface RecipientGroupOption {
    key: string;
    name: string;
}

const RECIPIENT_GROUPS: RecipientGroupOption[] = [
    {key: 'ALL', name: 'All Rostered Controllers'},
    {key: 'HOME_OBS', name: 'Home Observers'},
    {key: 'HOME_S1', name: 'Home S1'},
    {key: 'HOME_S2', name: 'Home S2'},
    {key: 'HOME_S3', name: 'Home S3'},
    {key: 'HOME_C1_C3', name: 'Home C1/C3'},
    {key: 'INSTRUCTORS', name: 'Instructors'},
    {key: 'MENTORS', name: 'Mentors'},
    {key: 'VISITING', name: 'Visiting Controllers'},
    {key: 'ALL_TRAINING_STAFF', name: 'All Training Staff'},
];

export default function BroadcastRecipientPicker({selectedGroups, onChange}: {
    selectedGroups: string[],
    onChange: (groups: string[]) => void,
}) {
    const selected = RECIPIENT_GROUPS.filter((g) => selectedGroups.includes(g.key));

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={RECIPIENT_GROUPS}
            groupBy={() => 'Groups'}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            value={selected}
            onChange={(event, newValue) => onChange(newValue.map((v) => v.key))}
            renderInput={(params) => <TextField {...params} label="Broadcast To" variant="filled"
                                                helperText="You cannot change this later."/>}
        />
    );
}
