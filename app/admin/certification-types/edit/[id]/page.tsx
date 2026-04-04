import React from 'react';
import {CertificationType} from "@/generated/prisma/client";
import prisma from "@/lib/db";
import {Box, Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";
import CertificationTypeForm from "@/components/CertificationTypes/CertificationTypeForm";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const certificationType: CertificationType | undefined = (await prisma.certificationType.findUnique({
        where: {
            id,
        },
    })) || undefined;


    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href="/admin/certification-types" style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5">Edit Certification Type</Typography>
                </Stack>
                <Box sx={{mt: 1,}}>
                    <CertificationTypeForm certificationType={certificationType}/>
                </Box>
            </CardContent>
        </Card>
    );
}