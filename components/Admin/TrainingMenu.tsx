import React from 'react';
import {Badge, ListItemIcon, ListItemText} from "@mui/material";
import {
    Assignment,
    BorderColor,
    CalendarMonth,
    Checklist,
    Class,
    Clear,
    Home,
    ListAlt,
    LocalActivity,
    ManageSearch,
    MilitaryTech,
    People,
    PersonAdd,
    QueryStats,
    Schedule,
    School,
    ViewWeek,
    WorkspacePremium,
} from "@mui/icons-material";
import prisma from "@/lib/db";
import MenuWrapper from './MenuWrapper';
import AdminListItemButton from "@/components/Admin/AdminListItemButton";

export default async function TrainingMenu() {

    const soloCertifications = await prisma.soloCertification.count();

    const homeTrainingRequests = await prisma.trainingAssignmentRequest.count({
        where: {student: {controllerStatus: "HOME"}},
    });

    const visitorTrainingRequests = await prisma.trainingAssignmentRequest.count({
        where: {student: {controllerStatus: "VISITOR"}},
    });

    const trainingReleaseRequests = await prisma.trainerReleaseRequest.count();

    const ta = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: "TA",
            },
        },
    });

    const pendingOtsRecs = await prisma.otsRecommendation.count({
        where: {
            assignedInstructorId: null,
        },
    });

    const taName = ta ? `${ta.firstName} ${ta.lastName || 'N/A'}` : 'N/A';

    return (
        <MenuWrapper title="Training Administration" subheadings={[`TA: ${taName}`]}>
            <AdminListItemButton href="/training/overview">
                <ListItemIcon>
                    <Home/>
                </ListItemIcon>
                <ListItemText primary="Overview"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/your-students">
                <ListItemIcon>
                    <School/>
                </ListItemIcon>
                <ListItemText primary="Your Students & Schedule"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/sessions">
                <ListItemIcon>
                    <LocalActivity/>
                </ListItemIcon>
                <ListItemText primary="Training Sessions"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/history">
                <ListItemIcon>
                    <ManageSearch/>
                </ListItemIcon>
                <ListItemText primary="Training History"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/calendar">
                <ListItemIcon>
                    <CalendarMonth/>
                </ListItemIcon>
                <ListItemText primary="Training Calendar"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/appointments">
                <ListItemIcon>
                    <Schedule/>
                </ListItemIcon>
                <ListItemText primary="Training Appointments"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/ots">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={pendingOtsRecs}>
                        <BorderColor/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="OTS Recommendations"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/assignments">
                <ListItemIcon>
                    <People/>
                </ListItemIcon>
                <ListItemText primary="Training Assignments"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/requests/man-request">
                <ListItemIcon>
                    <PersonAdd/>
                </ListItemIcon>
                <ListItemText primary="Manual Trainer Request"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/requests/home">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={homeTrainingRequests}>
                        <PersonAdd/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Home Requests"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/requests/visit">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={visitorTrainingRequests}>
                        <PersonAdd/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Visitor Requests"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/releases">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={trainingReleaseRequests}>
                        <Clear/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Trainer Release Requests"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/controller">
                <ListItemIcon>
                    <MilitaryTech/>
                </ListItemIcon>
                <ListItemText primary="Certifications"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/solos">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={soloCertifications}>
                        <WorkspacePremium/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Solo Endorsements"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/lessons">
                <ListItemIcon>
                    <Class/>
                </ListItemIcon>
                <ListItemText primary="Lessons"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/indicators">
                <ListItemIcon>
                    <Checklist/>
                </ListItemIcon>
                <ListItemText primary="Performance Indicators"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/progressions">
                <ListItemIcon>
                    <ViewWeek/>
                </ListItemIcon>
                <ListItemText primary="Progressions"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/progressions/assignments">
                <ListItemIcon>
                    <Assignment/>
                </ListItemIcon>
                <ListItemText primary="Progression Assignments"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/statistics">
                <ListItemIcon>
                    <QueryStats/>
                </ListItemIcon>
                <ListItemText primary="Training Statistics"/>
            </AdminListItemButton>
            <AdminListItemButton href="/training/logs">
                <ListItemIcon>
                    <ListAlt/>
                </ListItemIcon>
                <ListItemText primary="Logs"/>
            </AdminListItemButton>
        </MenuWrapper>
    );
}
