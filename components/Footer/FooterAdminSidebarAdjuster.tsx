'use client';
import React from 'react';
import {usePathname} from "next/navigation";
import {Box} from "@mui/material";
import {ADMIN_SIDEBAR_WIDTH, permanentSidebarResponsive} from "@/lib/adminSidebar";
import {isAdminPath} from "@/lib/adminPaths";

export default function FooterAdminSidebarAdjuster({children}: { children: React.ReactNode }) {

    const f = isAdminPath(usePathname());

    return (
        <Box sx={{ml: f ? permanentSidebarResponsive(0, ADMIN_SIDEBAR_WIDTH) : 0}}>
            {children}
        </Box>
    );
}