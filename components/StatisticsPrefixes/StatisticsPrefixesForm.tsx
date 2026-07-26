'use client';
import React, {useEffect} from 'react';
import {Autocomplete, Chip, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useStatisticsPrefixes, useUpdateStatisticsPrefixes} from "@/lib/osmium/hooks/stats";
import {toast} from "react-toastify";

export default function StatisticsPrefixesForm() {

    const {data: prefixes} = useStatisticsPrefixes();
    const updatePrefixes = useUpdateStatisticsPrefixes();
    const [selectedPrefixes, setSelectedPrefixes] = React.useState<string[]>([]);

    useEffect(() => {
        if (prefixes) {
            setSelectedPrefixes(prefixes.prefixes);
        }
    }, [prefixes]);

    const handleSubmit = async () => {
        try {
            await updatePrefixes.mutateAsync(selectedPrefixes);
            toast('Prefixes saved successfully!', {type: 'success'});
        } catch {
            toast('Error saving prefixes.', {type: 'error'});
        }
    }

    return (
        <form action={handleSubmit}>
            <Autocomplete
                sx={{mb: 1,}}
                multiple
                options={[]}
                value={selectedPrefixes}
                freeSolo
                renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => {
                        const {key, ...tagProps} = getTagProps({index});
                        return (
                            <Chip variant="filled" label={option} key={key} {...tagProps} />
                        );
                    })
                }
                onChange={(event, value) => {
                    setSelectedPrefixes(value.map((v) => v.toUpperCase()));
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        name="prefixes"
                        variant="filled"
                        helperText="The statistics system will only update hours and active ATC if the controller is active on a position that starts with any of these prefixes.  If none are set, statistics and active ATC will NOT be updated."
                        label="Prefixes"
                        placeholder="Prefixes (type and press ENTER after each one)"
                    />
                )}
            />
            <FormSaveButton/>
        </form>
    );
}

