'use client';
import React from 'react';
import {Avatar, Box, Card, CardContent, Chip, Grid, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {Edit} from "@mui/icons-material";
import Link from "next/link";
import UserStaffPositionChips from "@/components/StaffPositions/UserStaffPositionChips";
import DiscordLinkCard from "@/components/Profile/DiscordLinkButton";

// The fields ProfileCard renders. Structurally satisfied by both the legacy
// NextAuth/Prisma `User` (admin/staff views) and osmium-sourced adapters built
// from `/me` (self) or `/users/{cid}` (admin controller view). `rating` may be
// a numeric VATSIM index (Prisma) or an already-resolved label string (osmium).
export type ProfileCardUser = {
    cid: number | string;
    fullName: string;
    avatarUrl?: string | null;
    operatingInitials?: string | null;
    controllerStatus?: string | null;
    email?: string | null;
    preferredName?: string | null;
    rating: number | string;
    receiveEmail?: boolean;
    timezone?: string | null;
    bio?: string | null;
    noEditProfile?: boolean;
};

export default function ProfileCard({user, admin, viewOnly}: {
    user: ProfileCardUser,
    admin?: boolean,
    viewOnly?: boolean,
}) {

    return (
        (<Card sx={{height: '100%',}}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={user.avatarUrl ?? undefined}/>
                        <Box>
                            <Typography
                                variant="h6">{user.fullName} {user.operatingInitials ? `(${user.operatingInitials})` : ''}<Chip
                                sx={{ml: 1,}} label={user.controllerStatus}/></Typography>
                            <UserStaffPositionChips cid={Number(user.cid)}/>
                        </Box>
                    </Stack>
                    {!viewOnly && (admin || !user.noEditProfile) && <Box>
                        <Link href={admin ? `/admin/controller/${user.cid}/edit` : '/profile/edit'}
                              style={{color: 'inherit',}}>
                            <Tooltip title="Edit Profile">
                                <IconButton color="inherit">
                                    <Edit/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </Box>}
                </Stack>

                <Grid container columns={2} spacing={2} sx={{mt: 1,}}>
                    <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">VATSIM CID</Typography>
                        <Typography variant="body2">{user.cid}</Typography>
                    </Grid>
                    {!viewOnly && <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">Email</Typography>
                        <Typography variant="body2">{user.email}</Typography>
                    </Grid>}
                    <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">Preferred Name</Typography>
                        <Typography variant="body2">{user.preferredName || 'None'}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">Rating</Typography>
                        <Typography variant="body2">{typeof user.rating === 'number' ? getRating(user.rating) : user.rating}</Typography>
                    </Grid>
                    <Grid size={{
                        xs: 2,
                        sm: 1
                    }}>
                        <Typography variant="subtitle2">Receive Email</Typography>
                        <Typography variant="body2">{user.receiveEmail ? "Yes" : "No"}</Typography>
                    </Grid>
                    <Grid size={{
                        xs: 2,
                        sm: 1
                    }}>
                        <Typography variant="subtitle2">Timezone</Typography>
                        <Typography variant="body2">{user.timezone}</Typography>
                    </Grid>
                    {!viewOnly && !admin &&
                        <Grid size={{
                        xs: 2,
                        sm: 1
                    }}>
                        <Typography variant="subtitle2">Discord</Typography>
                        <DiscordLinkCard/>
                        </Grid>}
                    <Grid size={2}>
                        <Typography variant="subtitle2">Bio</Typography>
                        <Typography variant="body2">{user.bio || 'None'}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>)
    );
}