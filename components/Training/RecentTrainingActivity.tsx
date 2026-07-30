'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {getTimeAgo} from "@/lib/date";
import {useAuditLogs} from "@/lib/osmium/hooks/audit";

// osmium audit resource types that belong to the training domain. The osmium
// audit endpoint filters by a single resource_type, so we pull a recent page
// and filter to this set client-side (mirrors the old TRAINING_ONLY_LOG_MODELS).
const TRAINING_AUDIT_RESOURCE_TYPES = new Set([
    "TRAINING_SESSION",
    "TRAINING_ASSIGNMENT",
    "TRAINING_ASSIGNMENT_REQUEST",
    "TRAINING_ASSIGNMENT_REQUEST_INTEREST",
    "TRAINING_APPOINTMENT",
    "TRAINING_PROGRESSION",
    "TRAINING_PROGRESSION_ASSIGNMENT",
    "TRAINING_PROGRESSION_STEP",
    "TRAINER_RELEASE_REQUEST",
    "OTS_RECOMMENDATION",
    "LESSON",
    "LESSON_RUBRIC_CRITERIA",
    "LESSON_RUBRIC_CELL",
    "CERTIFICATION",
    "CERTIFICATION_TYPE",
    "SOLO_CERTIFICATION",
]);

export default function RecentTrainingActivity() {
    const {data} = useAuditLogs({pageSize: 50});

    const logs = (data?.items ?? [])
        .filter((log) => TRAINING_AUDIT_RESOURCE_TYPES.has(log.resource_type))
        .slice(0, 10);

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Recent Training Activity</Typography>
                {logs.length === 0 && <Typography sx={{mt: 1,}}>No recent training activity</Typography>}
                {logs.length > 0 && <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Actor</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Resource</TableCell>
                                <TableCell>ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{getTimeAgo(new Date(log.created_at))}</TableCell>
                                    <TableCell>{log.actor_display_name ?? log.actor_type}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.resource_type}</TableCell>
                                    <TableCell>{log.resource_id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>}
            </CardContent>
        </Card>
    );
}
