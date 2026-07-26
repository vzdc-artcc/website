'use client';
import React from 'react';
import {Badge} from "@mui/material";
import {Task} from "@mui/icons-material";
import {useAdminVisitorApplications} from "@/lib/osmium/hooks/visitor";

export default function PendingVisitorApplicationsBadge() {
    const {data} = useAdminVisitorApplications({status: 'PENDING', pageSize: 1});

    return (
        <Badge color="primary" badgeContent={data?.total ?? 0}>
            <Task/>
        </Badge>
    );
}
