'use client';
import React from 'react';
import {Box, Container} from "@mui/material";
import {useAdminMetadata} from "@/components/Admin/AdminSidebarContext";

export default function LayoutContainerResolver({children,}: { children: React.ReactNode }) {

    const adminMeta = useAdminMetadata();

    if (adminMeta) {
        return (
            <Box sx={{m: 2,}}>
                {children}
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{mt: 2,}}>
            {children}
        </Container>
    );
}