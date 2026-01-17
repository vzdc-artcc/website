import React from 'react';
import {ListItemButton, ListItemIcon, ListItemText,} from "@mui/material";
import Link from "next/link";
import {
    Home,
    SettingsApplications,
} from "@mui/icons-material";
import prisma from "@/lib/db";
import MenuWrapper from './MenuWrapper';


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
            title="Web-System Administration"
            subheadings={[
                `WM: ${wmName}`,
            ]}
        >
            <Link href="/web-system/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Home/>
                    </ListItemIcon>
                    <ListItemText primary="Overview"/>
                </ListItemButton>
            </Link>
            <Link href="/web-system/discord-config" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <SettingsApplications/>
                    </ListItemIcon>
                    <ListItemText primary="Discord Configuration"/>
                </ListItemButton>
            </Link>
        </MenuWrapper>
    );
}