import React from 'react';
import {Box, Button} from "@mui/material";
import Link from "next/link";
import {KeyboardArrowLeft} from "@mui/icons-material";
import ReceivedFeedbackDetail from "@/components/Feedback/ReceivedFeedbackDetail";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const {id} = await props.params;

    return (
        <Box>
            <Link href="/profile/feedback" style={{color: 'inherit',}}>
                <Button color="inherit" startIcon={<KeyboardArrowLeft/>} sx={{mb: 2,}}>All feedback</Button>
            </Link>
            <ReceivedFeedbackDetail feedbackId={id}/>
        </Box>
    );
}