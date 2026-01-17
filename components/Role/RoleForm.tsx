'use client';
import React from 'react';
import {User} from "next-auth";
import {Box, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography} from "@mui/material";
import {Role} from "@prisma/client";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {saveRoles} from "@/actions/role";

export default function RoleForm({user, isWebSystemMember = false}: { user: User, isWebSystemMember?: boolean, }) {

    const handleSubmit = async (formData: FormData) => {
        const {errors} = await saveRoles(formData);
        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'})
            return;
        }

        toast("Roles saved successfully.", {type: 'success'});
    };

    const allowedRoles = Object.keys(Role).filter((r) => r !== 'WEB_TEAM' || isWebSystemMember);
    const defaultSelected = (user.roles || []).filter((r) => allowedRoles.includes(r));

    return (
        <>
            {user.controllerStatus === "NONE" &&
                <Typography>
                    User is not a rostered controller.
                </Typography>}
            {user.controllerStatus !== "NONE" && <form action={handleSubmit}>
                <input type="hidden" name="userId" value={user.id}/>
                <Stack direction="column" spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="role-select-label">Role(s)</InputLabel>
                        <Select
                            variant="filled"
                            labelId="role-select-label"
                            id="role-select"
                            multiple
                            name="roles"
                            defaultValue={defaultSelected}
                            label="Staff Position(s)"
                            renderValue={(selected: any) => (
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                    {selected.map((value: string) => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </Box>
                            )}>
                            {allowedRoles.map((role) => (
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField variant="filled" fullWidth label="Dossier Entry*" name="dossier"/>
                    <Box>
                        <FormSaveButton/>
                    </Box>
                </Stack>
            </form>}
        </>
    );

}