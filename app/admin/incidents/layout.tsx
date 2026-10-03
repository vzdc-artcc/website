import React from 'react';
import {Stack, Typography} from "@mui/material";

export default async function Layout({children}: { children: React.ReactNode }) {
    return (
        <Stack direction="column" spacing={1}>
            <Typography
                variant="subtitle2"
                color="red"
                sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    border: 1
                }}>DO NOT
                DISSEMINATE</Typography>
            {children}
        </Stack>
    );
}