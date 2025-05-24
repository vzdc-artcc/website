import React from 'react';
import {Avatar, Box, Card, CardContent, Chip, Grid2, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {User} from "next-auth";
import {Edit} from "@mui/icons-material";
import Link from "next/link";
import {getChips} from "@/lib/staffPositions";

export default async function ProfileCard({user, admin, viewOnly}: {
    user: User,
    admin?: boolean,
    viewOnly?: boolean,
}) {

    // @ts-ignore
    return (
        (<Card sx={{height: '100%',}}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={user.avatarUrl}/>
                        <Box>
                            <Typography
                                variant="h6">{user.fullName} {user.operatingInitials ? `(${user.operatingInitials})` : ''}<Chip
                                sx={{ml: 1,}} label={user.controllerStatus}/></Typography>
                            {getChips(user)}
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

                <Grid2 container columns={2} spacing={2} sx={{mt: 1,}}>
                    <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">VATSIM CID</Typography>
                        <Typography variant="body2">{user.cid}</Typography>
                    </Grid2>
                    {!viewOnly && <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">Email</Typography>
                        <Typography variant="body2">{user.email}</Typography>
                    </Grid2>}
                    <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">Preferred Name</Typography>
                        <Typography variant="body2">{user.preferredName || 'None'}</Typography>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Typography variant="subtitle2">Rating</Typography>
                        <Typography variant="body2">{getRating(user.rating)}</Typography>
                    </Grid2>
                    <Grid2 size={{
                        xs: 2,
                        sm: 1
                    }}>
                        <Typography variant="subtitle2">Receive Email</Typography>
                        <Typography variant="body2">{user.receiveEmail ? "Yes" : "No"}</Typography>
                    </Grid2>
                    <Grid2 size={{
                        xs: 2,
                        sm: 1
                    }}>
                        <Typography variant="subtitle2">Timezone</Typography>
                        <Typography variant="body2">{user.timezone}</Typography>
                    </Grid2>
                    <Grid2 size={2}>
                        <Typography variant="subtitle2">Bio</Typography>
                        <Typography variant="body2">{user.bio || 'None'}</Typography>
                    </Grid2>
                </Grid2>
            </CardContent>
        </Card>)
    );
}