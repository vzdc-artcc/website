'use client';
import React from 'react';
import {Box, FormControlLabel, FormGroup, Skeleton, Switch, TextField, Typography} from '@mui/material';
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useUpdateUserFlags, useUserFlags} from "@/lib/osmium/hooks/users";

export default function UserSettingsForm({cid}: { cid: number, }) {

    const {data: flags, isLoading} = useUserFlags(cid);
    const updateFlags = useUpdateUserFlags();

    const handleSubmit = async (formData: FormData) => {
        const reason = (formData.get("dossier") as string || '').trim();
        if (!reason) {
            toast('A dossier entry is required.', {type: "error"});
            return;
        }

        try {
            await updateFlags.mutateAsync({
                cid,
                reason,
                no_request_loas: formData.get("allowedLoas") !== "on",
                no_event_signup: formData.get("allowedEventSignup") !== "on",
                no_edit_profile: formData.get("allowedEditProfile") !== "on",
                no_request_training_assignments: formData.get("allowedTrainingRequests") !== "on",
                no_force_progression_finish: formData.get("allowedForceProgressionFinish") !== "on",
                no_request_trainer_release: formData.get("allowedTrainerRelease") !== "on",
                excluded_from_roster_sync: formData.get("excludedRosterUpdate") === "on",
                hidden_from_roster: formData.get("hiddenFromRoster") === "on",
            });
        } catch {
            toast('Failed to update user settings.', {type: "error"});
            return;
        }
        toast("User settings updated.", {type: "success"});
    }

    if (isLoading || !flags) {
        return <Skeleton variant="rectangular" height={280}/>;
    }

    return (
        <form action={handleSubmit}>
            <FormGroup>
                <FormControlLabel control={<Switch defaultChecked={!flags.no_event_signup}/>}
                                  label="Allowed to signup for events?" name="allowedEventSignup"/>
                <FormControlLabel control={<Switch defaultChecked={!flags.no_request_loas}/>}
                                  label="Allowed to request LOAs?" name="allowedLoas"/>
                <FormControlLabel control={<Switch defaultChecked={!flags.no_edit_profile}/>}
                                  label="Allowed to edit profile?" name="allowedEditProfile"/>
                <FormControlLabel control={<Switch defaultChecked={!flags.no_request_training_assignments}/>}
                                  label="Allowed to request training assignments?" name="allowedTrainingRequests"/>
                <FormControlLabel control={<Switch defaultChecked={!flags.no_force_progression_finish}/>}
                                  label="Allowed to force complete training progressions after meeting reqs?"
                                  name="allowedForceProgressionFinish"/>
                <FormControlLabel control={<Switch defaultChecked={!flags.no_request_trainer_release}/>}
                                  label="Allowed to release training assignment?" name="allowedTrainerRelease"/>
                <FormControlLabel control={<Switch defaultChecked={flags.excluded_from_roster_sync}/>}
                                  label="Excluded from VATUSA Roster Update?" name="excludedRosterUpdate"/>
                <FormControlLabel control={<Switch defaultChecked={flags.hidden_from_roster}/>}
                                  label="Hidden from roster?" name="hiddenFromRoster"/>
            </FormGroup>
            <Box sx={{my: 2}}>
                <TextField required variant="filled" fullWidth label="Dossier Entry" name="dossier"/>
                <Typography variant="caption" color="text.secondary">
                    Required — recorded as a dossier entry explaining this change.
                </Typography>
            </Box>
            <FormSaveButton/>
        </form>
    );

}
