import React from 'react';
import {Badge, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import Link from "next/link";
import {
    AccessTime,
    AddModerator,
    AirplanemodeActive,
    Badge as BadgeIcon,
    BarChart,
    CellTower,
    Chat,
    DeleteSweep,
    EmojiPeople,
    Feedback,
    Folder,
    Home,
    ListAlt,
    MilitaryTech,
    Report,
    Send,
    Task,
    ViewCompact
} from "@mui/icons-material";
import prisma from "@/lib/db";
import MenuWrapper from './MenuWrapper';

export default async function AdminMenu() {

    const pendingVisitorApplications = await prisma.visitorApplication.count({
        where: {
            status: "PENDING",
        },
    });

    const pendingFeedback = await prisma.feedback.count({
        where: {
            status: "PENDING",
        },
    });

    const activeIncidentReports = await prisma.incidentReport.count({
        where: {
            closed: false,
        },
    });

    const pendingLoas = await prisma.lOA.count({
        where: {
            status: "PENDING",
        },
    });

    const atm = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: "ATM",
            },
        },
    });

    const datm = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: "DATM",
            },
        },
    });

    const atmName = atm ? `${atm.firstName} ${atm.lastName || 'N/A'}` : 'N/A';
    const datmName = datm ? `${datm.firstName} ${datm.lastName || 'N/A'}` : 'N/A';

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
            <Link href="/admin/airports" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <AirplanemodeActive/>
                    </ListItemIcon>
                    <ListItemText primary="Airports"/>
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
                        <Badge color="primary" badgeContent={pendingLoas}>
                            <AccessTime/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="LOA Center"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/mail" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Send/>
                    </ListItemIcon>
                    <ListItemText primary="Send Email"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/discord/announcements" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Chat/>
                    </ListItemIcon>
                    <ListItemText primary="Discord Announcements"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/visitor-applications" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={pendingVisitorApplications}>
                            <Task/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Visitor Applications"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/feedback" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={pendingFeedback}>
                            <Feedback/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Feedback"/>
                </ListItemButton>
            </Link>
            <Link href="/admin/incidents" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={activeIncidentReports}>
                            <Report/>
                        </Badge>
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