import React from 'react';
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import ProfileEditCard from "@/components/Profile/ProfileEditCard";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {ArrowBack} from "@mui/icons-material";
import Link from "next/link";


export default async function Page() {

    const session = await getServerSession(authOptions);

    if (session?.user.noEditProfile) {
        return (
            <Card>
                <CardContent>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="h4">Edit Profile</Typography>
                        <Typography variant="body1">You are not allowed to edit your profile.</Typography>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const user = session?.user;

    return user && (
        <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2} sx={{
                alignItems: "center"
            }}>
                <Link href="/profile/overview" style={{color: 'inherit',}}>
                    <Tooltip title="Go Back">
                        <IconButton color="inherit">
                            <ArrowBack fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                </Link>
                <Typography variant="h4">Edit Profile</Typography>
            </Stack>
            <ProfileEditCard user={user} sessionUser={user}/>
        </Stack>
    );
}