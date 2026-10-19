import React from 'react';
import {Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";

export default async function Page() {

    return (
        <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
        }}>
            <Info color="info"/>
            <Typography>Enter a CID to fetch controller.</Typography>
        </Stack>
    );

}