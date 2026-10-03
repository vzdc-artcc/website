'use client';
import React from 'react';
import {usePathname} from "next/navigation";
import {isAdminPath} from "@/lib/adminPaths";
import {Box, Container} from "@mui/material";

export default function LayoutContainerResolver({children,}: { children: React.ReactNode }) {

    const f = isAdminPath(usePathname());

    if (f) {
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