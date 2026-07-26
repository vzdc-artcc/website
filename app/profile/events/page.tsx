import React from 'react';
import {Box, Button} from "@mui/material";
import {KeyboardArrowLeft} from "@mui/icons-material";
import Link from "next/link";
import ProfileEventsTable from "@/components/Event/ProfileEventsTable";

export default function Page() {

    return (
        <Box>
            <Link href="/profile/overview" style={{color: 'inherit',}}>
                <Button color="inherit" startIcon={<KeyboardArrowLeft/>} sx={{mb: 2,}}>Profile</Button>
            </Link>
            <ProfileEventsTable/>
        </Box>
    );
}
