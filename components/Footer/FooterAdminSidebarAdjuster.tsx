'use client';
import React from 'react';
import {Box} from "@mui/material";
import {ADMIN_SIDEBAR_WIDTH, permanentSidebarResponsive} from "@/lib/adminSidebar";
import {useAdminMetadata} from "@/components/Admin/AdminSidebarContext";

export default function FooterAdminSidebarAdjuster({children}: { children: React.ReactNode }) {

    const adminMeta = useAdminMetadata();

    return (
        <Box sx={{ml: adminMeta ? permanentSidebarResponsive(0, ADMIN_SIDEBAR_WIDTH) : 0}}>
            {children}
        </Box>
    );
}