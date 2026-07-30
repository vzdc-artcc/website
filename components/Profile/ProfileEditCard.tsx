'use client';
import React from 'react';
import {Filter} from 'bad-words';
import {Autocomplete, Card, CardContent, Divider, Stack, TextField} from "@mui/material";
import {z} from "zod";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useMe, useUpdateMe} from "@/lib/osmium/hooks/me";
import {useAdminUpdateProfile, useReassignOperatingInitials, useUserByCid} from "@/lib/osmium/hooks/users";
import {useCreateDossierEntry} from "@/lib/osmium/hooks/training";

export default function ProfileEditCard({cid, admin = false}: {
    cid?: number,
    admin?: boolean,
}) {

    const router = useRouter();
    const updateMe = useUpdateMe();
    const {data: me} = useMe();

    // In admin mode the target controller comes from osmium's /users/{cid}; in
    // self mode the current user's data comes from /me.
    const {data: targetData} = useUserByCid(admin ? cid : undefined);
    const targetProfile = targetData?.full?.profile;
    const adminUpdate = useAdminUpdateProfile();
    const reassignOi = useReassignOperatingInitials();
    const createDossier = useCreateDossierEntry(cid ?? 0);

    const displayName = admin
        ? ([targetProfile?.first_name, targetProfile?.last_name].filter(Boolean).join(' ') || targetData?.basic.name)
        : me?.display_name;
    const displayCid = admin ? cid : me?.cid;
    const displayRating = admin ? (targetData?.basic.rating ?? '') : (me?.rating ?? '');
    const defaultTimezone = (admin ? targetProfile?.timezone : me?.profile.timezone) || '';
    const defaultPreferredName = (admin ? targetProfile?.preferred_name : me?.profile.preferred_name) || '';
    const defaultBio = (admin ? targetProfile?.bio : me?.profile.bio) || '';
    const defaultOperatingInitials = (admin ? targetProfile?.operating_initials : me?.profile.operating_initials) || '';

    const handleSubmit = async (formData: FormData) => {
        const schema = z.object({
            preferredName: z.string().max(40, "Preferred name must not be over 40 characters").optional(),
            bio: z.string().max(400, "Bio must not be over 400 characters").optional(),
            operatingInitials: z.string().length(2, "Operating Initials must be 2 characters").toUpperCase(),
            timezone: z.string().min(1, "Timezone is required"),
        });

        const result = schema.safeParse({
            preferredName: formData.get('preferredName') as string,
            bio: formData.get('bio') as string,
            operatingInitials: formData.get('operatingInitials') as string || defaultOperatingInitials,
            timezone: formData.get('timezone') as string,
        });

        if (!result.success) {
            toast(result.error.errors.map((e) => e.message).join(".  "), {type: 'error'})
            return;
        }

        const filter = new Filter();

        if (filter.isProfane(result.data.preferredName || '') || filter.isProfane(result.data.bio || '')) {
            if (admin && cid) {
                await createDossier.mutateAsync({
                    message: `Staff ${me?.cid} attempted to force update profile with profanity in preferred name or bio.`,
                }).catch(() => undefined);
            }
            toast('Please ensure your preferred name and bio do not contain any profanity.  This incident has been added to your dossier.', {type: 'error'});
            return;
        }

        if (admin && cid) {
            try {
                await adminUpdate.mutateAsync({
                    cid,
                    body: {
                        preferred_name: result.data.preferredName || null,
                        bio: result.data.bio || null,
                        timezone: result.data.timezone,
                    },
                });
                await reassignOi.mutateAsync({cid, operatingInitials: result.data.operatingInitials});
            } catch (e) {
                const status = (e as { status?: number })?.status;
                toast(
                    status === 400 ? 'Those operating initials are already in use.' : 'Failed to update profile.',
                    {type: 'error'},
                );
                return;
            }

            router.push(`/admin/controller/${cid}`);
            toast('Profile updated successfully!', {type: 'success'});
            return;
        }

        try {
            await updateMe.mutateAsync({
                preferred_name: result.data.preferredName || null,
                bio: result.data.bio || null,
                timezone: result.data.timezone,
            });
        } catch {
            toast('Failed to update profile.', {type: 'error'});
            return;
        }

        router.push('/profile/overview');
        toast('Profile updated successfully!', {type: 'success'});
    }

    const timezones = Intl.supportedValuesOf("timeZone");

    // Wait for the source data so the uncontrolled defaultValue fields render
    // with the right values (self: /me; admin: /users/{cid}).
    if (admin ? !targetData : !me) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <form action={handleSubmit}>
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth disabled variant="filled" label="Name" value={displayName ?? ''}/>
                        <TextField fullWidth disabled variant="filled" label="VATSIM CID" value={displayCid ?? ''}/>
                        <TextField fullWidth disabled variant="filled" label="Rating" value={displayRating}/>
                        <Autocomplete
                            options={timezones}
                            defaultValue={defaultTimezone}
                            renderInput={(params) => (
                                <TextField {...params} label="Timezone" variant="filled" name="timezone"/>
                            )}
                        />
                        <Divider/>
                        <TextField fullWidth variant="filled" name="preferredName" label="Preferred Name"
                                   defaultValue={defaultPreferredName}/>
                        <TextField fullWidth multiline rows={5} variant="filled" name="bio" label="Bio"
                                   defaultValue={defaultBio}/>
                        {admin &&
                            <TextField variant="filled" name="operatingInitials" label="Operating Initials"
                                       helperText="Initials are automatically converted to uppercase on submit."
                                       defaultValue={defaultOperatingInitials}/>
                        }
                        <FormSaveButton/>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
}
