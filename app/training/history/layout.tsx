import React from 'react';
import {Box, Card, CardContent, Stack, Typography} from "@mui/material";
import CidForm from "@/components/Form/CidForm";


export default function Layout({children}: { children: React.ReactNode, }) {
    
    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Controller Training History</Typography>
                    <Box sx={{my: 2,}}>
                        <CidForm basePath="/training/history"/>
                    </Box>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </Stack>
    );
}