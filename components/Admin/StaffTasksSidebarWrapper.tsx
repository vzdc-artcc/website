'use client';
import React from 'react';
import {Box} from "@mui/material";
import {useAdminMetadata} from "@/components/Admin/AdminSidebarContext";
import {ADMIN_SIDEBAR_WIDTH, permanentSidebarResponsive} from "@/lib/adminSidebar";

export default function StaffTasksSidebarWrapper({children}: { children: React.ReactNode }) {

    const adminMeta = useAdminMetadata();

    if (!adminMeta) return (
        <>
            {children}
        </>
    );

    return (
        <Box sx={{ml: permanentSidebarResponsive(0, ADMIN_SIDEBAR_WIDTH)}}>
            {children}
        </Box>
    );
}