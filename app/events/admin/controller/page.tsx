import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";

function Page() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Info color="info"/>
                    <Typography>Enter a CID to fetch controller.</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default Page;