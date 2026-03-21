"use client";

import React, { useEffect, useState } from "react";
import {Autocomplete, Grid2, TextField, Box, Typography, Button, Divider} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {fetchAllUsers} from "@/actions/eventPosition";
import {Event, EventPosition, User} from "@prisma/client";
import Form from "next/form";
import {toast} from "react-toastify";
import FormSaveButton from "../Form/FormSaveButton";
import {saveOpsPlan} from "@/actions/opsPlan";

export default function OpsPlanForm({
                                           admin,
                                           currentUser,
                                           event,
                                           eventPosition,
                                       }: {
    admin?: boolean;
    currentUser: User;
    event: Event;
    eventPosition?: EventPosition | null;
}) {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [user, setUser] = useState<string>(currentUser.id || '');
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<boolean>(false);

    const hasFeaturedFields = (event?.featuredFields || []).length > 0;

    useEffect(() => {
        const initial: Record<string, string> = {};

        const configs = (event as any)?.featuredFieldConfigs || {};

        (event?.featuredFields || []).forEach((f) => {
            const keyUpper = (f || '').toString().toUpperCase();

            let value: any = undefined;
            if (configs && typeof configs === 'object') {
                if (Object.prototype.hasOwnProperty.call(configs, keyUpper)) {
                    value = configs[keyUpper];
                } else if (Object.prototype.hasOwnProperty.call(configs, f)) {
                    value = configs[f];
                }
            }

            if (value === undefined || value === null) {
                initial[f] = '';
            } else if (typeof value === 'string') {
                initial[f] = value;
            } else {
                try {
                    initial[f] = JSON.stringify(value);
                } catch {
                    initial[f] = String(value);
                }
            }
        });

        setFieldConfigs(initial);
    }, [event?.id, event?.featuredFields, (event as any)?.featuredFieldConfigs]);


    useEffect(() => {
        if (admin) {
            fetchAllUsers().then((users) => setAllUsers(users as User[]));
        }
    }, [admin]);

    const handleSubmit = async (formData: FormData) => {
        if (!admin && (eventPosition || event.positionsLocked)) return;

        setSaving(true);
        try {
            formData.set('userId', user);
            formData.set('eventId', event.id);
            formData.set('featuredFieldConfigs', JSON.stringify(fieldConfigs));

            const { event: updatedEvent, errors } = await saveOpsPlan(event, formData, admin);

            if (errors) {
                toast.error(errors.map((error) => error.message).join('.  '));
                return;
            }

            toast.success('OPS Plan saved successfully.');
        } catch (err) {
            console.error(err);
            toast.error('An unexpected error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const saveDisabled = saving || (!admin && (eventPosition || event.positionsLocked));

    return (
        <Form action={handleSubmit}>
            <Grid2 container columns={6} spacing={2}>
                { admin && (
                    <Grid2 size={6}>
                        <Autocomplete
                            options={allUsers}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} - ${getRating(option.rating)} (${option.cid})`}
                            value={allUsers.find((u) => u.id === user) || null}
                            onChange={(event, newValue) => {
                                setUser(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => <TextField {...params} label="Event Planner" />}
                        />
                    </Grid2>
                )}

                { hasFeaturedFields && (
                    <Grid2 size={6}>
                        <Divider />
                    </Grid2>
                ) }

                { hasFeaturedFields ? (
                    (event.featuredFields || []).map((field) => (
                        <Grid2 size={2} key={field}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label={`${field} configuration`}
                                value={fieldConfigs[field] ?? ''}
                                onChange={(e) =>
                                    setFieldConfigs((prev) => ({ ...prev, [field]: e.target.value }))
                                }
                                helperText={`Enter configuration for featured field "${field}"`}
                            />
                        </Grid2>
                    ))
                ) : (
                    <Grid2 size={6}>
                        <Box sx={{ p: 2, borderRadius: 1, bgcolor: "background.paper", boxShadow: 1 }}>
                            <Typography variant="h6">No featured fields</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                This event does not have any featured fields configured. Add featured fields on the event configuration page to display per-field options here.
                            </Typography>
                        </Box>
                    </Grid2>
                )}

                <Grid2 size={6} sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                    { saveDisabled ? (
                        <Button variant="contained" disabled>
                            Save
                        </Button>
                    ) : (
                        <FormSaveButton text="Save" />
                    )}
                </Grid2>
            </Grid2>
        </Form>
    );
}
