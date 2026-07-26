'use client';
import React from 'react';
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Rating,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import {getTimeAgo} from "@/lib/date";
import Link from "next/link";
import {KeyboardArrowRight, Visibility} from "@mui/icons-material";
import {useReceivedFeedback} from "@/lib/osmium/hooks/feedback";

export default function FeedbackCard({cid}: { cid: number, }) {

    const {data, isLoading} = useReceivedFeedback(cid, {status: 'RELEASED', pageSize: 3});
    const recentFeedback = data?.items ?? [];
    const feedbackCount = data?.total ?? 0;

    if (isLoading) {
        return <CircularProgress/>;
    }

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography variant="h6" sx={{mb: 1,}}>Feedback</Typography>
                {recentFeedback.length == 0 && <Typography>You have no feedback.</Typography>}
                {recentFeedback.length > 0 && <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Submitted</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentFeedback.map(feedback => (
                                <TableRow key={feedback.id}>
                                    <TableCell>{getTimeAgo(new Date(feedback.submitted_at))}</TableCell>
                                    <TableCell>{feedback.controller_position}</TableCell>
                                    <TableCell><Rating readOnly value={feedback.rating}/></TableCell>
                                    <TableCell>
                                        <Tooltip title="View Feedback">
                                            <Link href={`/profile/feedback/${feedback.id}`} style={{color: 'inherit',}}>
                                                <IconButton>
                                                    <Visibility/>
                                                </IconButton>
                                            </Link>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>}
                {feedbackCount > 3 && <Stack direction="row" justifyContent="flex-end" sx={{mt: 1,}}>
                    <Link href="/profile/feedback" style={{color: 'inherit', textDecoration: 'none',}}>
                        <Button color="inherit" endIcon={<KeyboardArrowRight/>}>View all Feedback</Button>
                    </Link>
                </Stack>}
            </CardContent>
        </Card>
    );
}
