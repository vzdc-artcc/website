'use client';
import React from 'react';
import {
    Box,
    CircularProgress,
    IconButton,
    Rating,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import Link from "next/link";
import {Visibility} from "@mui/icons-material";
import {useReceivedFeedback} from "@/lib/osmium/hooks/feedback";
import {formatZuluDate} from "@/lib/date";
import {useMe} from "@/lib/osmium/hooks/me";

export default function ReceivedFeedbackList() {
    const {data: me} = useMe();
    const {data, isLoading} = useReceivedFeedback(me?.cid ?? NaN, {status: 'RELEASED', pageSize: 200});

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    const items = data?.items ?? [];

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Submitted</TableCell>
                        <TableCell>Position Staffed</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((feedback) => (
                        <TableRow key={feedback.id}>
                            <TableCell>{formatZuluDate(new Date(feedback.submitted_at))}</TableCell>
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
        </TableContainer>
    );
}
