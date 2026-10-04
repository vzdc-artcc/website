import React from 'react';
import {Badge, ListItemIcon, ListItemText} from "@mui/material";
import {
    AccessTime,
    AddModerator,
    AirplanemodeActive,
    Badge as BadgeIcon,
    BarChart,
    CellTower,
    DeleteSweep,
    EmojiPeople,
    Feedback,
    FiberNew,
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
import AdminListItemButton from "@/components/Admin/AdminListItemButton";

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
            <AdminListItemButton href="/admin/overview">
                <ListItemIcon>
                    <Home/>
                </ListItemIcon>
                <ListItemText primary="Overview"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/airports">
                <ListItemIcon>
                    <AirplanemodeActive/>
                </ListItemIcon>
                <ListItemText primary="Airports"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/certification-types">
                <ListItemIcon>
                    <MilitaryTech/>
                </ListItemIcon>
                <ListItemText primary="Certification Types"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/purge-assistant">
                <ListItemIcon>
                    <DeleteSweep/>
                </ListItemIcon>
                <ListItemText primary="Purge Assistant"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/oi-matrix">
                <ListItemIcon>
                    <ViewCompact/>
                </ListItemIcon>
                <ListItemText primary="O.I. Matrix"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/controller">
                <ListItemIcon>
                    <BadgeIcon/>
                </ListItemIcon>
                <ListItemText primary="Controller Management"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/staff">
                <ListItemIcon>
                    <AddModerator/>
                </ListItemIcon>
                <ListItemText primary="Staff Management"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/loas">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={pendingLoas}>
                        <AccessTime/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="LOA Center"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/mail">
                <ListItemIcon>
                    <Send/>
                </ListItemIcon>
                <ListItemText primary="Send Email"/>
            </AdminListItemButton>
            {/*<AdminListItemButton href="/admin/discord/announcements">*/}
            {/*    <ListItemIcon>*/}
            {/*        <Chat/>*/}
            {/*    </ListItemIcon>*/}
            {/*    <ListItemText primary="Discord Announcements"/>*/}
            {/*</AdminListItemButton>*/}
            <AdminListItemButton href="/admin/visitor-applications">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={pendingVisitorApplications}>
                        <Task/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Visitor Applications"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/feedback">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={pendingFeedback}>
                        <Feedback/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Feedback"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/incidents">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={activeIncidentReports}>
                        <Report/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Incident Reports"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/files">
                <ListItemIcon>
                    <Folder/>
                </ListItemIcon>
                <ListItemText primary="File Center"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/innovation">
                <ListItemIcon>
                    <FiberNew/>
                </ListItemIcon>
                <ListItemText primary="Innovation Center"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/stats-prefixes">
                <ListItemIcon>
                    <BarChart/>
                </ListItemIcon>
                <ListItemText primary="Statistics Prefixes"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/broadcasts">
                <ListItemIcon>
                    <CellTower/>
                </ListItemIcon>
                <ListItemText primary="Broadcasts"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/welcome-messages">
                <ListItemIcon>
                    <EmojiPeople/>
                </ListItemIcon>
                <ListItemText primary="Welcome Messages"/>
            </AdminListItemButton>
            <AdminListItemButton href="/admin/logs">
                <ListItemIcon>
                    <ListAlt/>
                </ListItemIcon>
                <ListItemText primary="Logs"/>
            </AdminListItemButton>
        </MenuWrapper>
    );
}