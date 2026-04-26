import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";

export default function NotFound() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Info color="error"/>
                    <Typography>Controller not found. Make sure they have logged in to the website at least one
                        time</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}