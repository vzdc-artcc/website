'use client';
import React from 'react';
import Logo from "@/components/Logo/Logo";
import {useAdminMetadata} from "@/components/Admin/AdminSidebarContext";
import {Box} from "@mui/material";
import {ADMIN_SIDEBAR_WIDTH, permanentSidebarResponsive} from "@/lib/adminSidebar";

export default function NavbarLogo() {

    const adminMeta = useAdminMetadata();

    if (adminMeta) {
        return (<Box sx={{width: permanentSidebarResponsive('auto', ADMIN_SIDEBAR_WIDTH), height: '100%', mx: 2,}}>
            <Box sx={{display: permanentSidebarResponsive('block', 'none')}}><Logo/></Box>
        </Box>);
    } else {
        return (<Box sx={{mx: 2,}}><Logo/></Box>);
    }
}
