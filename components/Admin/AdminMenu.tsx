'use client';
import React from 'react';
import {ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import Link from "next/link";
import {
    AddModerator,
    Badge as BadgeIcon,
    BarChart,
    CellTower,
    Chat,
    DeleteSweep,
    EmojiPeople,
    Folder,
    Home,
    ListAlt,
    MilitaryTech,
    ViewCompact
} from "@mui/icons-material";
import MenuWrapper from './MenuWrapper';
import PendingFeedbackBadge from './PendingFeedbackBadge';
import PendingIncidentsBadge from './PendingIncidentsBadge';
import PendingLoaBadge from './PendingLoaBadge';
import PendingVisitorApplicationsBadge from './PendingVisitorApplicationsBadge';
import {useStaffPositionHolderName} from "@/lib/osmium/hooks/staff-positions";

export default function AdminMenu() {

    const atmName = useStaffPositionHolderName("ATM");
    const datmName = useStaffPositionHolderName("DATM");

    return (
        <MenuWrapper 
            title="Facility Administration" 
            subheadings={[
                `ATM: ${atmName}`,
                `DATM: ${datmName}`
            ]}
        >
            <Link href="/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Home/>
                    </ListItemIcon>
                    <ListItemText primary="Overview"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/certification-types" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <MilitaryTech/>
                    </ListItemIcon>
                    <ListItemText primary="Certification Types"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/purge-assistant" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <DeleteSweep/>
                    </ListItemIcon>
                    <ListItemText primary="Purge Assistant"/>
                </ListItemButton>
            </Link>

            <Link href="/admin/oi-matrix" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <ViewCompact/>
                    </ListItemIcon>
                    <ListItemText primary="O.I. Matrix"/>
                </ListItemButton>
            </Link>

            <Link href="/admin/controller" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <BadgeIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Controller Management"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/staff" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <AddModerator/>
                    </ListItemIcon>
                    <ListItemText primary="Staff Management"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/loas" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <PendingLoaBadge/>
                    </ListItemIcon>
                    <ListItemText primary="LOA Center"/>
                </ListItemButton>
            </Link>
            {/*<Link href="/admin/discord/announcements" style={{textDecoration: 'none', color: 'inherit',}}>*/}
            <ListItemButton disabled>
                    <ListItemIcon>
                        <Chat/>
                    </ListItemIcon>
                    <ListItemText primary="Discord Announcements"/>
                </ListItemButton>
            {/*</Link>*/}
            <Link href="/admin/visitor-applications" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <PendingVisitorApplicationsBadge/>
                    </ListItemIcon>
                    <ListItemText primary="Visitor Applications"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/feedback" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <PendingFeedbackBadge/>
                    </ListItemIcon>
                    <ListItemText primary="Feedback"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/incidents" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <PendingIncidentsBadge/>
                    </ListItemIcon>
                    <ListItemText primary="Incident Reports"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/files" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Folder/>
                    </ListItemIcon>
                    <ListItemText primary="File Center"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/stats-prefixes" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <BarChart/>
                    </ListItemIcon>
                    <ListItemText primary="Statistics Prefixes"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/broadcasts" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <CellTower/>
                    </ListItemIcon>
                    <ListItemText primary="Broadcasts"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/welcome-messages" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <EmojiPeople/>
                    </ListItemIcon>
                    <ListItemText primary="Welcome Messages"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/logs" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <ListAlt/>
                    </ListItemIcon>
                    <ListItemText primary="Logs"/>
                </ListItemButton>
            </Link>
        </MenuWrapper>
    );
}