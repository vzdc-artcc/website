'use client';
import React from 'react';
import {Autocomplete, TextField} from "@mui/material";

export type DiscordResourceOption = {
    id: string;
    label: string;
};

/**
 * A picker for a Discord snowflake (guild / channel / role / category) that
 * populates its options from live bot discovery while still allowing a raw id
 * to be typed. The resolved id is written to a hidden input named `name` so the
 * surrounding server-action `<form action={...}>` keeps reading it from FormData.
 *
 * `freeSolo` keeps the field usable when the bot is offline (discovery empty) —
 * an operator can still paste an id manually. `autoHighlight` makes the keyboard
 * Enter select the highlighted option rather than committing the search text.
 *
 * We deliberately let the input clear on blur (MUI's default) when the committed
 * text didn't resolve to an id: a picked option or a typed numeric id is backed
 * by `value` and gets restored to its label, but unresolved free text empties the
 * field so the visible `required` validation reflects the empty hidden id instead
 * of passing while nothing was actually selected.
 */
export default function DiscordResourceSelect({
    name,
    label,
    options,
    defaultId,
    loading,
    required,
    helperText,
}: {
    name: string;
    label: string;
    options: DiscordResourceOption[];
    defaultId?: string | null;
    loading?: boolean;
    required?: boolean;
    helperText?: string;
}) {
    const [value, setValue] = React.useState<DiscordResourceOption | null>(
        defaultId ? {id: defaultId, label: defaultId} : null,
    );

    // When options arrive after mount (async discovery), upgrade a bare-id value
    // to its human-readable label without clobbering an explicit user choice.
    React.useEffect(() => {
        setValue((current) => {
            if (!current || current.label !== current.id) return current;
            return options.find((o) => o.id === current.id) ?? current;
        });
    }, [options]);

    const selectedId = value?.id ?? '';

    return (
        <>
            <input type="hidden" name={name} value={selectedId} readOnly/>
            <Autocomplete
                freeSolo
                autoHighlight
                autoSelect
                selectOnFocus
                handleHomeEndKeys
                loading={loading}
                options={options}
                value={value}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                isOptionEqualToValue={(option, val) => option.id === val.id}
                onChange={(_event, newValue) => {
                    if (newValue == null) {
                        // Explicit clear (the X button).
                        setValue(null);
                    } else if (typeof newValue === 'string') {
                        // freeSolo commit (Enter / autoSelect-on-blur passes the
                        // input text). Resolve it back to an option by label/id, or
                        // accept a raw snowflake. Never wipe a valid selection when
                        // the committed text is just leftover search text.
                        const trimmed = newValue.trim();
                        const match = options.find((o) => o.label === trimmed || o.id === trimmed);
                        if (match) {
                            setValue(match);
                        } else if (/^\d+$/.test(trimmed)) {
                            setValue({id: trimmed, label: trimmed});
                        }
                    } else {
                        setValue(newValue);
                    }
                }}
                onInputChange={(_event, newInput, reason) => {
                    // Support typing/pasting a raw snowflake without selecting an
                    // option. A name typed to search is not an id, so ignore it.
                    if (reason !== 'input') return;
                    const trimmed = newInput.trim();
                    if (/^\d+$/.test(trimmed)) {
                        setValue({id: trimmed, label: trimmed});
                    }
                }}
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
