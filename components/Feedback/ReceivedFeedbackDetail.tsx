'use client';
import React from 'react';
import {Box, CircularProgress, Typography} from "@mui/material";
import FeedbackCard from "@/components/Feedback/FeedbackCard";
import {useFeedbackItem} from "@/lib/osmium/hooks/feedback";
import {useMe} from "@/lib/osmium/hooks/me";

export default function ReceivedFeedbackDetail({feedbackId}: { feedbackId: string }) {
    const {data: me} = useMe();
    const viewerCid = me?.cid;
    const {data: feedback, isLoading} = useFeedbackItem(feedbackId);

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    // Mirrors the site's previous restriction: a controller can only view
    // feedback about them here once it has been released, even though the
    // API itself allows the target to fetch it at any status.
    const isVisible = !!feedback && feedback.status === "RELEASED" && feedback.target_cid === viewerCid;

    if (!isVisible || !feedback) {
        return <Typography>Feedback not found.</Typography>;
    }

    return <FeedbackCard feedback={feedback}/>;
}
