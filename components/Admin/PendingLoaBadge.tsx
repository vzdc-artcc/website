'use client';
import React from 'react';
import {Badge} from "@mui/material";
import {AccessTime} from "@mui/icons-material";
import {useAdminLoas} from "@/lib/osmium/hooks/loa";

export default function PendingLoaBadge() {
    const {data} = useAdminLoas({status: 'PENDING', pageSize: 1});

    return (
        <Badge color="primary" badgeContent={data?.total ?? 0}>
            <AccessTime/>
        </Badge>
    );
}
