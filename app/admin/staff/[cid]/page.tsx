'use client';
import React, {use} from 'react';
import {notFound} from "next/navigation";
import {CircularProgress, Grid, Stack} from "@mui/material";
import ProfileCard, {ProfileCardUser} from "@/components/Profile/ProfileCard";
import UserPermissionsCard from "@/components/Access/UserPermissionsCard";
import StaffPositionsCard from "@/components/Access/StaffPositionsCard";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import {osmiumBaseUrl} from "@/lib/osmium/client";

export default function Page(props: { params: Promise<{ cid: string }> }) {
    const {cid} = use(props.params);
    const cidNum = Number(cid);
    const {data, isLoading} = useUserByCid(cidNum);

    if (isLoading) {
        return <Stack alignItems="center" sx={{p: 4}}><CircularProgress/></Stack>;
    }
    if (!data) {
        notFound();
    }

    const {basic, full} = data;
    const profile = full?.profile;
    const user: ProfileCardUser = {
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
        (<Grid container columns={2} spacing={2}>
            <Grid size={2}>
                <ProfileCard user={user} admin/>
            </Grid>
            <Grid size={2}>
                <StaffPositionsCard cid={cidNum}/>
            </Grid>
            <Grid size={2}>
                <UserPermissionsCard cid={cidNum}/>
            </Grid>
        </Grid>)
    );
}
