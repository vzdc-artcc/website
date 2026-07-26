'use client';
import React from 'react';
import {Badge} from "@mui/material";
import {Report} from "@mui/icons-material";
import {useAdminIncidentList} from "@/lib/osmium/hooks/incidents";

export default function PendingIncidentsBadge() {
    const {data} = useAdminIncidentList({closed: false, pageSize: 1});

    return (
        <Badge color="primary" badgeContent={data?.total ?? 0}>
            <Report/>
        </Badge>
    );
}
