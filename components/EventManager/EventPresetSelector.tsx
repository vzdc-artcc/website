'use client';
import {Autocomplete, Box, Chip, Stack, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {toast} from "react-toastify";
import {useEventPositionPresets, useEventPresetPositions, useUpdateEventPresetPositions} from "@/lib/osmium/hooks/events";

export default function EventPresetSelector({event}: { event: { id: string } }) {

    const {data: presetPositionsData} = useEventPresetPositions(event.id);
    const {data: bundlesData} = useEventPositionPresets();
    const updatePresetPositions = useUpdateEventPresetPositions(event.id);
    const [positions, setPositions] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (presetPositionsData && !initialized) {
            setPositions(presetPositionsData);
            setInitialized(true);
        }
    }, [presetPositionsData, initialized]);

    const handleSubmit = async () => {
        try {
            await updatePresetPositions.mutateAsync(positions);
            toast.success('Preset positions updated successfully!');
        } catch {
            toast.error('Failed to update preset positions.');
        }
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    multiple
                    options={[]}
                    value={positions}
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
                        setPositions(value);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="filled"
                            label="Positions"
                            placeholder="Positions (type and press ENTER after each one)"
                        />
                    )}
                />

                <Autocomplete
                    options={bundlesData?.items ?? []}
                    getOptionLabel={(option) => `${option.name} (${option.positions.length} positions)`}
                    onChange={(event, value) => {
                        setPositions(value?.positions || []);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="filled"
                            label="SET from Event Position Preset"
                            placeholder="Presets"
                        />
                    )}
                />
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </form>
    )

}
