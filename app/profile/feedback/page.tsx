import React from 'react';
import {Box, Button, Card, CardContent, Typography} from "@mui/material";
import Link from "next/link";
import {KeyboardArrowLeft} from "@mui/icons-material";
import ReceivedFeedbackList from "@/components/Feedback/ReceivedFeedbackList";

export default function Page() {

    return (
        <Box>
            <Link href="/profile/overview" style={{color: 'inherit',}}>
                <Button color="inherit" startIcon={<KeyboardArrowLeft/>} sx={{mb: 2,}}>Profile</Button>
            </Link>
            <Card>
                <CardContent>
                    <Typography variant="h5">Your Feedback</Typography>
                    <ReceivedFeedbackList/>
                </CardContent>
            </Card>
        </Box>

    );
}