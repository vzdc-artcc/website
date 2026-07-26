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
    const {data: otsData} = useOtsRecommendations();
    const {data: requestsData} = useTrainingAssignmentRequests();
    const {data: releasesData} = useTrainerReleaseRequests();

    const pendingOtsRecs = (otsData?.items ?? []).filter((o) => !o.assigned_instructor_id).length;
    const homeTrainingRequests = (requestsData?.items ?? []).filter((r) => r.student_controller_status === 'HOME').length;
    const visitorTrainingRequests = (requestsData?.items ?? []).filter((r) => r.student_controller_status === 'VISITOR').length;
    const pendingReleaseRequests = (releasesData?.items ?? []).filter((r) => r.status === 'PENDING').length;

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
