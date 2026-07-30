'use client';
import React from 'react';
import {Badge, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import Link from "next/link";
import {QuestionAnswer} from "@mui/icons-material";
import {useAdminStaffingRequests} from "@/lib/osmium/hooks/staffing";

export default function EventsMenuStaffingBadge() {
    const {data} = useAdminStaffingRequests({pageSize: 1});

    return (
        <Link href="/events/admin/staffing-requests" style={{textDecoration: 'none', color: 'inherit',}}>
            <ListItemButton>
                <ListItemIcon>
                    <Badge color="primary" badgeContent={data?.total ?? 0}>
                        <QuestionAnswer/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Staffing Requests"/>
            </ListItemButton>
        </Link>
    );
}
