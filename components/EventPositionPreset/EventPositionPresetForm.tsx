'use client';
import {Autocomplete, Box, Chip, Stack, TextField} from "@mui/material";
import {EventPositionPreset} from "@/generated/prisma/browser";
import Form from "next/form";
import {useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {createOrUpdateEventPreset} from "@/actions/eventPreset";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function EventPositionPresetForm({ positionPreset }: { positionPreset?: EventPositionPreset }) {
    
    const router = useRouter();
    const [positions, setPositions] = useState<string[]>(positionPreset?.positions || []);

    const handleSubmit = async (formData: FormData) => {
        formData.set('positions', positions.join(','));

        const {errors} = await createOrUpdateEventPreset(formData);

        if (errors) {
            toast.error(errors.map((e) => e.message).join('. '));
            return;
        }

        if (!positionPreset) {
            toast.success('Event position preset created successfully!');
            router.push('/events/admin/event-presets');
        } else {
            toast.success('Event position preset updated successfully!');
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="id" value={positionPreset?.id || ''} />
            <Stack direction="column" spacing={2}>
                <TextField name="name" label="Name" defaultValue={positionPreset?.name || ''} required fullWidth/>
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
                            name="positions"
                            variant="filled"
                            label="Positions"
                            placeholder="Positions (type and press ENTER after each one)"
                        />
                    )}
                />
                <Box>
                    <FormSaveButton />
                </Box>
            </Stack>
        </Form>
    );
}