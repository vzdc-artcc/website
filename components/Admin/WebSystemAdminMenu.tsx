import React from 'react';
import {ListItemIcon, ListItemText,} from "@mui/material";
import {Home, SettingsApplications,} from "@mui/icons-material";
import prisma from "@/lib/db";
import MenuWrapper from './MenuWrapper';
import AdminListItemButton from "@/components/Admin/AdminListItemButton";


export default async function WebSystemAdminMenu() {

    const wm = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: "WM",
            },
        },
    });


    const wmName = wm ? `${wm.firstName} ${wm.lastName || 'N/A'}` : 'N/A';

    return (
        <MenuWrapper
            title="Web System Administration"
            subheadings={[
                `WM: ${wmName}`,
            ]}
        >
            <AdminListItemButton href="/web-system/overview">
                <ListItemIcon>
                    <Home/>
                </ListItemIcon>
                <ListItemText primary="Overview"/>
            </AdminListItemButton>
            <AdminListItemButton href="/web-system/discord-configs">
                <ListItemIcon>
                    <SettingsApplications/>
                </ListItemIcon>
                <ListItemText primary="Discord Configuration"/>
            </AdminListItemButton>
        </MenuWrapper>
    );
}