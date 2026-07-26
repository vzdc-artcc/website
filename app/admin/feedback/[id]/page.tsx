'use client';
import React from 'react';
import {useParams} from 'next/navigation';
import {Box, CircularProgress, Typography} from "@mui/material";
import FeedbackCard from "@/components/Feedback/FeedbackCard";
import {useFeedbackItem} from "@/lib/osmium/hooks/feedback";

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data: feedback, isLoading, isError} = useFeedbackItem(params.id);

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !feedback) {
        return <Typography>Feedback not found.</Typography>;
    }

    return (
        <FeedbackCard feedback={feedback} admin/>
    );
}
