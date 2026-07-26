'use client';
import {Autocomplete, Box, Chip, Stack, TextField} from "@mui/material";
import {useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useCreateEventPositionPreset, useUpdateEventPositionPreset} from "@/lib/osmium/hooks/events";

interface PresetLike {
    id: string;
    name: string;
    positions: string[];
}

export default function EventPositionPresetForm({positionPreset}: { positionPreset?: PresetLike }) {

    const router = useRouter();
    const createPreset = useCreateEventPositionPreset();
    const updatePreset = useUpdateEventPositionPreset();
    const [name, setName] = useState(positionPreset?.name || '');
    const [positions, setPositions] = useState<string[]>(positionPreset?.positions || []);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Please enter a name.');
            return;
        }

        try {
            if (positionPreset) {
                await updatePreset.mutateAsync({presetId: positionPreset.id, body: {name, positions}});
                toast.success('Event position preset updated successfully!');
            } else {
                await createPreset.mutateAsync({name, positions});
                toast.success('Event position preset created successfully!');
                router.push('/events/admin/event-presets');
            }
        } catch {
            toast.error('Failed to save event position preset.');
        }
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth/>
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
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </form>
    );
}
