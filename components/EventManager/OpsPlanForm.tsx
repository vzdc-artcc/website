'use client';

import React, {useEffect, useState} from "react";
import {Autocomplete, Box, Chip, Divider, Grid, TextField, Typography} from "@mui/material";
import FormSaveButton from "../Form/FormSaveButton";
import {toast} from "react-toastify";
import {useEventOpsPlan, useUpdateEventOpsPlan} from "@/lib/osmium/hooks/events";
import {useRosterControllers} from "@/lib/osmium/hooks/users";

export default function OpsPlanForm({event}: { event: { id: string } }) {
    const {data: opsPlan} = useEventOpsPlan(event.id);
    const updateOpsPlan = useUpdateEventOpsPlan(event.id);
    const {data: controllersData} = useRosterControllers();
    const controllers = controllersData?.items ?? [];

    const [plannerId, setPlannerId] = useState<string | null>(null);
    const [featuredFields, setFeaturedFields] = useState<string[]>([]);
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, string>>({});
    const [initialized, setInitialized] = useState(false);

    const hasFeaturedFields = featuredFields.length > 0;

    useEffect(() => {
        if (!opsPlan || initialized) return;

        const configs = (opsPlan.featured_field_configs && typeof opsPlan.featured_field_configs === 'object')
            ? opsPlan.featured_field_configs as Record<string, unknown>
            : {};
        const fields = opsPlan.featured_fields ?? [];
        const initial: Record<string, string> = {};
        fields.forEach((f) => {
            const value = configs[f.toUpperCase()] ?? configs[f];
            if (value == null) initial[f] = '';
            else if (typeof value === 'string') initial[f] = value;
            else initial[f] = JSON.stringify(value);
        });
        setFeaturedFields(fields);
        setFieldConfigs(initial);
        setPlannerId(opsPlan.ops_planner_id ?? null);
        setInitialized(true);
    }, [opsPlan, initialized]);

    const handleSubmit = async () => {
        try {
            await updateOpsPlan.mutateAsync({
                ops_planner_id: plannerId,
                featured_fields: featuredFields,
                featured_field_configs: fieldConfigs,
            });
            toast.success('OPS Plan saved successfully.');
        } catch {
            toast.error('An unexpected error occurred while saving.');
        }
    };

    return (
        <form action={handleSubmit}>
            <Grid container columns={6} spacing={2}>
                <Grid size={6}>
                    <Autocomplete
                        options={controllers}
                        getOptionLabel={(option) => `${option.basic.name} (${option.basic.cid})`}
                        value={controllers.find((c) => c.full?.id === plannerId) || null}
                        onChange={(e, newValue) => setPlannerId(newValue?.full?.id ?? null)}
                        renderInput={(params) => <TextField {...params} label="Event Planner"/>}
                    />
                </Grid>

                <Grid size={6}>
                    <Autocomplete
                        multiple
                        options={[]}
                        value={featuredFields}
                        freeSolo
                        renderTags={(value: readonly string[], getTagProps) =>
                            value.map((option: string, index: number) => {
                                const {key, ...tagProps} = getTagProps({index});
                                return <Chip variant="filled" label={option} key={key} {...tagProps} />;
                            })
                        }
                        onChange={(e, value) => setFeaturedFields(value.map((v) => v.toUpperCase()))}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="filled"
                                label="Featured Fields"
                                helperText="Airports/fields featured on the public event page (type and press ENTER after each one)"
                            />
                        )}
                    />
                </Grid>

                {hasFeaturedFields && (
                    <Grid size={6}>
                        <Divider/>
                    </Grid>
                )}

                {hasFeaturedFields ? (
                    featuredFields.map((field) => (
                        <Grid size={2} key={field}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label={`${field} configuration`}
                                value={fieldConfigs[field] ?? ''}
                                onChange={(e) =>
                                    setFieldConfigs((prev) => ({...prev, [field]: e.target.value}))
                                }
                                helperText={`Enter configuration for featured field "${field}"`}
                            />
                        </Grid>
                    ))
                ) : (
                    <Grid size={6}>
                        <Box sx={{p: 2, borderRadius: 1, bgcolor: "background.paper", boxShadow: 1}}>
                            <Typography variant="h6">No featured fields</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                This event does not have any featured fields configured yet.
                            </Typography>
                        </Box>
                    </Grid>
                )}

                <Grid size={6} sx={{display: 'flex', justifyContent: 'flex-start', mt: 2}}>
                    <FormSaveButton text="Save"/>
                </Grid>
            </Grid>
        </form>
    );
}
