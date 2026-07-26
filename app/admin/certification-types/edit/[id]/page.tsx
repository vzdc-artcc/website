'use client';
import React, {use} from 'react';
import {Box, Card, CardContent, IconButton, Skeleton, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";
import CertificationTypeForm from "@/components/CertificationTypes/CertificationTypeForm";
import {useCertificationTypes} from "@/lib/osmium/hooks/certifications";
import {notFound} from "next/navigation";

export default function Page(props: { params: Promise<{ id: string }> }) {
    const {id} = use(props.params);

    const {data, isLoading} = useCertificationTypes();
    const certificationType = data?.items.find((ct) => ct.id === id);

    if (!isLoading && data && !certificationType) {
        notFound();
    }

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
                    {isLoading || !certificationType
                        ? <Skeleton height={300}/>
                        : <CertificationTypeForm certificationType={certificationType}/>}
                </Box>
            </CardContent>
        </Card>
    );
}
