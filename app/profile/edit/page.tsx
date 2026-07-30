import React from 'react';
import {IconButton, Stack, Tooltip, Typography} from "@mui/material";
import ProfileEditCard from "@/components/Profile/ProfileEditCard";
import FlagGate from "@/components/Access/FlagGate";
import {ArrowBack} from "@mui/icons-material";
import Link from "next/link";

export default function Page() {

    return (
        <FlagGate flag="no_edit_profile" deniedHeading="Edit Profile"
                  deniedMessage="You are not allowed to edit your profile.">
            <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href="/profile/overview" style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h4">Edit Profile</Typography>
                </Stack>
                <ProfileEditCard/>
            </Stack>
        </FlagGate>
    );
}
