'use client';
import React from 'react';
import {Badge} from "@mui/material";
import {Feedback} from "@mui/icons-material";
import {useFeedbackList} from "@/lib/osmium/hooks/feedback";

export default function PendingFeedbackBadge() {
    const {data} = useFeedbackList({status: 'PENDING', pageSize: 1});

    return (
        <Badge color="primary" badgeContent={data?.total ?? 0}>
            <Feedback/>
        </Badge>
    );
}
