import React from 'react';
import {Button, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Home} from "@mui/icons-material";

export default function NotFound() {
    return (
        <Stack direction="column" spacing={2} sx={{
            alignItems: "center"
        }}>
            <Typography variant="h4">404: Not found</Typography>
            <Typography>The page you were looking for was not found.</Typography>
            <Link href="/">
                <Button variant="contained" size="large" startIcon={<Home/>}>Home</Button>
            </Link>
        </Stack>
    );
}