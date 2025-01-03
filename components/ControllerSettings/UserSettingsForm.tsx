'use client';
import React from 'react';
import {User} from "next-auth";
import {Box, FormControlLabel, FormGroup, Switch, TextField} from '@mui/material';
import {updateSettings} from "@/actions/user";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function UserSettingsForm({user}: { user: User, }) {

    const handleSubmit = async (formData: FormData) => {
        const error = await updateSettings(formData);
        if (error) {
            toast(error, {type: "error"});
            return;
        }
        toast("User settings updated.", {type: "success"});
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={user.id}/>
            <FormGroup>
                <FormControlLabel control={<Switch defaultChecked={!user.noEventSignup}/>}
                                  label="Allowed to signup for events?" name="allowedEventSignup"/>
                <FormControlLabel control={<Switch defaultChecked={!user.noRequestLoas}/>}
                                  label="Allowed to request LOAs?" name="allowedLoas"/>
                <FormControlLabel control={<Switch defaultChecked={!user.noEditProfile}/>}
                                  label="Allowed to edit profile?" name="allowedEditProfile"/>
                <FormControlLabel control={<Switch defaultChecked={!user.noRequestTrainingAssignments}/>}
                                  label="Allowed to request training assignments?" name="allowedTrainingRequests"/>
                <FormControlLabel control={<Switch defaultChecked={!user.noForceProgressionFinish}/>}
                                  label="Allowed to force complete training progressions after meeting reqs?"
                                  name="allowedForceProgressionFinish"/>
                <FormControlLabel control={<Switch defaultChecked={!user.noRequestTrainerRelease}/>}
                                  label="Allowed to release training assignment?" name="allowedTrainerRelease"/>
                <FormControlLabel control={<Switch defaultChecked={user.excludedFromVatusaRosterUpdate}/>}
                                  label="Excluded from VATUSA Roster Update?" name="excludedRosterUpdate"/>
                <FormControlLabel control={<Switch defaultChecked={user.hiddenFromRoster}/>}
                                  label="Hidden from roster?" name="hiddenFromRoster"/>
            </FormGroup>
            <Box sx={{my: 2}}>
                <TextField required variant="filled" fullWidth label="Dossier Entry" name="dossier"/>
            </Box>
            <FormSaveButton/>
        </form>
    );

}