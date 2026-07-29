'use client';
import React from 'react';
import {Autocomplete, TextField} from "@mui/material";

/**
 * A free-text-with-suggestions picker for a config "Name" (the logical key the
 * bot matches on, e.g. `staffup` or `impromptu_s1`). Operators can pick a known
 * name from the dropdown or type their own. The current value is mirrored into a
 * hidden input named `name` so the surrounding server-action `<form action>`
 * keeps reading it from FormData.
 *
 * Because the value *is* the text (no id/label split), controlling `inputValue`
 * and updating on every change captures both typing and option selection.
 */
export default function DiscordNameSelect({
    name,
    label,
    options,
    defaultValue,
    required,
    helperText,
}: {
    name: string;
    label: string;
    options: readonly string[];
    defaultValue?: string | null;
    required?: boolean;
    helperText?: string;
}) {
    const [value, setValue] = React.useState<string>(defaultValue ?? '');

    return (
        <>
            <input type="hidden" name={name} value={value} readOnly/>
            <Autocomplete
                freeSolo
                options={options as string[]}
                inputValue={value}
                onInputChange={(_event, newValue) => setValue(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="filled"
                        label={label}
                        required={required}
                        helperText={helperText}
                    />
                )}
            />
        </>
    );
}
