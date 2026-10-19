import React from 'react';
import {Box, Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import CertificationTypeForm from "@/components/CertificationTypes/CertificationTypeForm";
import Link from "next/link";

export default function Page() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} sx={{
                    alignItems: "center"
                }}>
                    <Link href="/admin/certification-types" style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5">New Certification Type</Typography>
                </Stack>
                <Box sx={{mt: 1,}}>
                    <CertificationTypeForm/>
                </Box>
            </CardContent>
        </Card>
    );
}