'use client';
import React from 'react';
import {User} from "next-auth";
import {Box, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography} from '@mui/material';
import {StaffPosition} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {saveStaffPositions} from "@/actions/role";
import FormSaveButton from "@/components/Form/FormSaveButton";

function StaffPositionForm({user}: { user: User }) {

    const handleSubmit = async (formData: FormData) => {

        const {errors} = await saveStaffPositions(formData);

        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'})
            return;
        }

        toast("Staff positions saved!", {type: 'success'})

    }

    return (
        <>
            {user.controllerStatus === "NONE" &&
                <Typography>
                    User is not a rostered controller.
                </Typography>}
            {user.controllerStatus !== "NONE" && <form action={handleSubmit}>
                <input type="hidden" name="userId" value={user.id}/>
                <input type="hidden" name="roles" value={user.roles}/>
                <Stack direction="column" spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="staff-position-select-label">Staff Position(s)</InputLabel>
                        <Select
                            variant="filled"
                            labelId="staff-position-select-label"
                            id="staff-position-select"
                            multiple
                            name="staffPositions"
                            defaultValue={user.staffPositions}
                            label="Staff Position(s)"
                            renderValue={(selected) => (
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </Box>
                            )}>
                            {Object.keys(StaffPosition).map((position) => (
                                <MenuItem key={position} value={position}>{position}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField variant="filled" fullWidth label="Dossier Entry*" name="dossier"/>
                    <Box>
                        <FormSaveButton />
                    </Box>
                </Stack>
            </form>}
        </>

    );
}

export default StaffPositionForm;