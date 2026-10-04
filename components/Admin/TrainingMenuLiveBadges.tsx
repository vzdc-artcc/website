'use client';
import React from 'react';
import {Badge, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import Link from "next/link";
import {BorderColor, Clear, PersonAdd} from "@mui/icons-material";
import {
    useOtsRecommendations,
    useTrainerReleaseRequests,
    useTrainingAssignmentRequests,
} from "@/lib/osmium/hooks/training";

export default function TrainingMenuLiveBadges() {
    // Counts only: one row per request, reading the filtered `total`.
    const pendingOtsRecs = useOtsRecommendations({pageSize: 1, assigned: false}).data?.total ?? 0;
    const homeTrainingRequests = useTrainingAssignmentRequests({pageSize: 1, studentControllerStatus: 'HOME'}).data?.total ?? 0;
    const visitorTrainingRequests = useTrainingAssignmentRequests({pageSize: 1, studentControllerStatus: 'VISITOR'}).data?.total ?? 0;
    const pendingReleaseRequests = useTrainerReleaseRequests({pageSize: 1, status: 'PENDING'}).data?.total ?? 0;

    return (
        <>
            <Link href="/training/ots" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={pendingOtsRecs}>
                            <BorderColor/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="OTS Recommendations"/>
                </ListItemButton>
            </Link>
            <Link href="/training/requests/home" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={homeTrainingRequests}>
                            <PersonAdd/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Home Requests"/>
                </ListItemButton>
            </Link>
            <Link href="/training/requests/visit" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={visitorTrainingRequests}>
                            <PersonAdd/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Visitor Requests"/>
                </ListItemButton>
            </Link>
            <Link href="/training/releases" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={pendingReleaseRequests}>
                            <Clear/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Trainer Release Requests"/>
                </ListItemButton>
            </Link>
        </>
    );
}
