import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";

export default function NotFound() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} sx={{
                    alignItems: "center"
                }}>
                    <Info color="error"/>
                    <Typography>Airport not found. Make sure the ICAO code is spelled correctly and is present in our
                        airport database.</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}