'use client';
import React from 'react';
import {StatisticsPrefixes} from "@/generated/prisma/browser";
import {Autocomplete, Chip, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {updatePrefixes} from "@/actions/statisticsPrefixes";
import {toast} from "react-toastify";

export default function StatisticsPrefixesForm({prefixes}: { prefixes?: StatisticsPrefixes, }) {

    const [selectedPrefixes, setSelectedPrefixes] = React.useState<string[]>(prefixes?.prefixes || []);

    const handleSubmit = async (formData: FormData) => {

        const {errors} = await updatePrefixes(formData);

        if (errors) {
            toast(errors.map((error) => error.message).join('.  '), {type: 'error'});
            return;
        }

        toast('Prefixes saved successfully!', {type: 'success'});
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={prefixes?.id}/>
            <input type="hidden" name="prefixes" value={selectedPrefixes.join(',')}/>
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

