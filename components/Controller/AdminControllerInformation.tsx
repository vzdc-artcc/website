'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, Grid, Stack, Typography} from "@mui/material";
import ProfileCard, {ProfileCardUser} from "@/components/Profile/ProfileCard";
import DossierForm from "@/components/Dossier/DossierForm";
import DossierTable from "@/components/Dossier/DossierTable";
import CertificationForm from "@/components/Certifications/CertificationForm";
import UserSettingsForm from "@/components/ControllerSettings/UserSettingsForm";
import TrainingSessionTable from '@/components/TrainingSession/TrainingSessionTable';
import {useUserByCid} from "@/lib/osmium/hooks/users";
import {useCoarseRoles} from "@/lib/osmium/coarseRoles";
import {osmiumBaseUrl} from "@/lib/osmium/client";

export default function AdminControllerInformation({cid}: { cid: string, }) {
    const cidNum = Number(cid);
    const {data, isLoading} = useUserByCid(cidNum);
    const {isStaff, isLoading: rolesLoading} = useCoarseRoles();

    if (isLoading || rolesLoading) {
        return <Stack alignItems="center" sx={{p: 4}}><CircularProgress/></Stack>;
    }

    if (!data) {
        return <Typography variant="h5" textAlign="center">Controller not found.</Typography>;
    }

    const {basic, full} = data;
    const profile = full?.profile;
    const controller: ProfileCardUser = {
        cid: basic.cid,
        fullName: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || basic.name,
        avatarUrl: profile?.avatar_asset_id ? `${osmiumBaseUrl}/cdn/${profile.avatar_asset_id}` : undefined,
        operatingInitials: profile?.operating_initials,
        controllerStatus: profile?.controller_status,
        email: profile?.email ?? '',
        preferredName: profile?.preferred_name,
        rating: basic.rating ?? '',
        timezone: profile?.timezone,
        bio: profile?.bio,
    };

    return (
        <Grid container columns={4} spacing={2}>
            <Grid
                size={{
                    xs: 4,
                    lg: 3
                }}>
                <ProfileCard user={controller} admin={isStaff}/>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>User Settings</Typography>
                        {!isStaff &&
                            <Typography>You are not allowed to view user settings.</Typography>}
                        {isStaff &&
                            <UserSettingsForm cid={cidNum}/>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Recent Training History</Typography>
                        <TrainingSessionTable admin studentCid={String(basic.cid)}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 2
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Add Dossier Entry</Typography>
                        <DossierForm cid={cidNum}/>
                        <Typography variant="h6" sx={{my: 2,}}>Member Dossier</Typography>
                        <DossierTable cid={cidNum}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 2
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Certifications</Typography>
                        <CertificationForm cid={cidNum}/>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
