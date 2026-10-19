'use client';
import {updateEventPresetPositions} from "@/actions/event";
import {Autocomplete, Box, Chip, Stack, TextField} from "@mui/material";
import {Event, EventPositionPreset} from "@/generated/prisma/browser";
import Form from "next/form";
import {useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {toast} from "react-toastify";

export default function EventPresetSelector({ event, presetPositions }: { event: Event, presetPositions: EventPositionPreset[] }) {

    const [positions, setPositions] = useState<string[]>(event.presetPositions);

    const handleSubmit = async () => {
        await updateEventPresetPositions(event.id, positions);

        toast.success('Preset positions updated successfully!');
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    multiple
                    options={[]}
                    value={positions}
                    freeSolo
                    renderValue={(value: readonly string[], getItemProps) =>
                        value.map((option: string, index: number) => {
                            const {key, ...tagProps} = getItemProps({index});
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
                            name="positions"
                            variant="filled"
                            label="Positions"
                            placeholder="Positions (type and press ENTER after each one)"
                        />
                    )}
                />

                <Autocomplete
                    options={presetPositions}
                    getOptionLabel={(option) => `${option.name} (${option.positions.length} positions)`}
                    onChange={(event, value) => {
                        setPositions(value?.positions || []);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            name="presets"
                            variant="filled"
                            label="SET from Event Position Preset"
                            placeholder="Presets"
                        />
                    )}
                />
                <Box>
                    <FormSaveButton />
                </Box>
            </Stack>
        </Form>
    )

}