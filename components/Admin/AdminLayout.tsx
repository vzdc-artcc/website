import React from 'react';
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {AppBar, Box, Drawer, Toolbar, Typography} from "@mui/material";
import {ADMIN_SIDEBAR_WIDTH, permanentSidebarResponsive} from "@/lib/adminSidebar";
import Logo from "@/components/Logo/Logo";
import {RegisterAdminSidebar} from "@/components/Admin/AdminSidebarContext";

export default async function AdminLayout({name, sidebar, allowed, children}: {
    name: string,
    sidebar: React.ReactNode,
    allowed: (user: User) => boolean,
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);

    if (!session || !allowed(session.user)) {
        return (
            <Typography variant="h5" sx={{
                textAlign: "center"
            }}>You do not have access to this page.</Typography>
        );
    }

    return (
        (<Box>
            <RegisterAdminSidebar name={name}>{sidebar}</RegisterAdminSidebar>
            <Drawer variant="permanent" sx={{
                width: ADMIN_SIDEBAR_WIDTH,
                [`& .MuiDrawer-paper`]: {width: ADMIN_SIDEBAR_WIDTH,},
                display: permanentSidebarResponsive('none', 'block'),
            }}>
                <AppBar position="relative" variant="outlined" color="inherit" sx={{borderLeft: 0, borderRight: 0,}}>
                    <Toolbar disableGutters>
                        <Box sx={{width: '100%', mx: 2,}}>
                            <Logo/>
                        </Box>
                    </Toolbar>
                </AppBar>

                {sidebar}
            </Drawer>
            <Box sx={{ml: permanentSidebarResponsive(0, ADMIN_SIDEBAR_WIDTH)}}>
                {children}
            </Box>
        </Box>)
    );
}