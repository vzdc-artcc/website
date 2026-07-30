'use client';

import React from 'react';
import {Avatar, Box, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography} from "@mui/material";
import UserStaffPositionChips from "@/components/StaffPositions/UserStaffPositionChips";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import {osmiumBaseUrl} from "@/lib/osmium/client";

export default function PublicProfileCard({cid}: {cid: number}) {
    const {data, isLoading} = useUserByCid(cid);

    if (isLoading) {
        return (
            <Card sx={{height: '100%',}}>
                <CardContent>
                    <Skeleton variant="rectangular" height={80}/>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    const {basic, full} = data;
    const profile = full?.profile;
    const name = ([profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || basic.name);

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={profile?.avatar_asset_id ? `${osmiumBaseUrl}/cdn/${profile.avatar_asset_id}` : undefined}/>
                    <Box>
                        <Typography variant="h6">
                            {name} {profile?.operating_initials ? `(${profile.operating_initials})` : ''}
                            {profile?.controller_status &&
                                <Chip sx={{ml: 1,}} label={profile.controller_status}/>}
                        </Typography>
                        <UserStaffPositionChips cid={cid}/>
                    </Box>
                </Stack>

                <Grid container columns={2} spacing={2} sx={{mt: 1,}}>
                    <Grid size={{xs: 2, sm: 1,}}>
                        <Typography variant="subtitle2">VATSIM CID</Typography>
                        <Typography variant="body2">{basic.cid}</Typography>
                    </Grid>
                    <Grid size={{xs: 2, sm: 1,}}>
                        <Typography variant="subtitle2">Rating</Typography>
                        <Typography variant="body2">{basic.rating ?? 'Unknown'}</Typography>
                    </Grid>
                    {profile && <>
                        <Grid size={{xs: 2, sm: 1,}}>
                            <Typography variant="subtitle2">Preferred Name</Typography>
                            <Typography variant="body2">{profile.preferred_name || 'None'}</Typography>
                        </Grid>
                        <Grid size={{xs: 2, sm: 1,}}>
                            <Typography variant="subtitle2">Timezone</Typography>
                            <Typography variant="body2">{profile.timezone}</Typography>
                        </Grid>
                        <Grid size={2}>
                            <Typography variant="subtitle2">Bio</Typography>
                            <Typography variant="body2">{profile.bio || 'None'}</Typography>
                        </Grid>
                    </>}
                </Grid>
            </CardContent>
        </Card>
    );
}
