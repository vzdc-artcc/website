'use client';
import React from 'react';
import {User} from "next-auth";
import {Filter} from 'bad-words';
import {Alert, Card, CardContent, Divider, Stack, Switch, TextField, Tooltip} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {z} from "zod";
import {toast} from "react-toastify";
import {updateCurrentProfile} from "@/actions/profile";
import {useRouter} from "next/navigation";
import {writeDossier} from "@/actions/dossier";
import FormSaveButton from "@/components/Form/FormSaveButton";
import FormControlLabel from '@mui/material/FormControlLabel';

export default function ProfileEditCard({user, sessionUser, admin = false}: {
    user: User,
    sessionUser: User,
    admin?: boolean,
}) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const User = z.object({
            preferredName: z.string().max(40, "Preferred name must not be over 40 characters").optional(),
            bio: z.string().max(400, "Bio must not be over 400 characters").optional(),
            operatingInitials: z.string().length(2, "Operating Initials must be 2 characters").toUpperCase(),
            receiveEmail: z.boolean(),
            newEventNotifications: z.boolean(),
            teamspeakUid: z.string().optional(),
        });

        const result = User.safeParse({
            preferredName: formData.get('preferredName') as string,
            teamspeakUid: !admin ? formData.get('teamspeakUid') as string : user.teamspeakUid,
            bio: formData.get('bio') as string,
            operatingInitials: formData.get('operatingInitials') as string || user.operatingInitials,
            receiveEmail: true,
            newEventNotifications: formData.get('newEventNotifications') === 'on',
        });

        if (!result.success) {
            toast(result.error.errors.map((e) => e.message).join(".  "), {type: 'error'})
            return;
        }

        const filter = new Filter();

        if (filter.isProfane(result.data.preferredName || '') || filter.isProfane(result.data.bio || '')) {
            await writeDossier(admin ?
                    `Staff ${sessionUser.cid} attempted to force update profile with profanity in preferred name or bio.` :
                    `Attempted to update profile with profanity in preferred name or bio.`,
                user.cid);
            toast('Please ensure your preferred name and bio do not contain any profanity.  This incident has been added to your dossier.', {type: 'error'});
            return;
        }

        const oiError = await updateCurrentProfile({...user, ...result.data});

        if (oiError) {
            toast(oiError, {type: 'error'});
            return;
        }

        if (admin) {
            router.push(`/admin/controller/${user.cid}`);
            return;
        } else {
            router.push('/profile/overview');
        }
        toast('Profile updated successfully!', {type: 'success'});
    }

    return (
        <Card>
            <CardContent>
                <form action={handleSubmit}>
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth disabled variant="filled" label="Name" value={user.fullName}/>
                        <TextField fullWidth disabled variant="filled" label="VATSIM CID" value={user.cid}/>
                        <TextField fullWidth disabled variant="filled" label="Rating" value={getRating(user.rating)}/>
                        <Divider/>
                        {!admin && <>
                            <Alert severity="info">The Teamspeak UID form has been moved to the profile dropdown
                                above &quot;Refresh VATUSA Account Information&quot;</Alert>
                            <Divider/>
                        </>}
                        <TextField fullWidth variant="filled" name="preferredName" label="Preferred Name"
                                   defaultValue={user.preferredName || ''}/>
                        <TextField fullWidth multiline rows={5} variant="filled" name="bio" label="Bio"
                                   defaultValue={user.bio || ''}/>
                        {admin &&
                            <TextField variant="filled" name="operatingInitials" label="Operating Initials"
                                       helperText="Initials are automatically converted to uppercase on submit."
                                       defaultValue={user.operatingInitials || ''}/>
                        }
                        <FormControlLabel name="newEventNotifications" control={<Switch defaultChecked={user.newEventNotifications} />} label="Receive NEW event notifications" />
                        <Tooltip  title={'As of now, this feature is DISABLED! Once implemented, toggling this off will remove you from any email notifications send from this site.'}  placement="top-start">
                            <FormControlLabel name="receiveEmail" checked disabled control={<Switch />} label="Receive non-urgent emails" />
                        </Tooltip>
                        <FormSaveButton />
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
}