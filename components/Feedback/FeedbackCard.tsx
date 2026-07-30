import React from 'react';
import {Card, CardContent, Chip, Grid, Rating, Stack, Typography} from "@mui/material";
import FeedbackDecisionForm from "@/components/Feedback/FeedbackDecisionForm";
import {components} from "@/lib/osmium/generated/schema";
import {formatZuluDate} from "@/lib/date";

type FeedbackItem = components["schemas"]["FeedbackItem"];

export default function FeedbackCard({feedback, admin}: { feedback: FeedbackItem, admin?: boolean, }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'RELEASED':
                return 'success';
            case 'STASHED':
                return 'error';
            default:
                return 'default';
        }
    }

    return (
        (<Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">Controller Feedback</Typography>
                    {admin && <Chip label={feedback.status} color={getStatusColor(feedback.status)}/>}
                </Stack>
                <Typography variant="subtitle2">{feedback.target_name} {feedback.target_cid && `(${feedback.target_cid})`}</Typography>
                <Typography variant="subtitle2">{formatZuluDate(new Date(feedback.submitted_at))}</Typography>
                <Grid container spacing={2} columns={2} sx={{mt: 2, mb: 4,}}>
                    {admin && (
                        <>
                            <Grid
                                size={{
                                    xs: 2,
                                    md: 1
                                }}>
                                <Typography variant="subtitle2">Pilot Name</Typography>
                                <Typography
                                    variant="body2">{feedback.submitter_name || 'Unknown'}</Typography>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 2,
                                    md: 1
                                }}>
                                <Typography variant="subtitle2">Pilot CID</Typography>
                                <Typography variant="body2">{feedback.submitter_cid ?? 'Unknown'}</Typography>
                            </Grid>
                        </>
                    )}
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Pilot Callsign</Typography>
                        <Typography variant="body2">{feedback.pilot_callsign}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Position Staffed</Typography>
                        <Typography variant="body2">{feedback.controller_position}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Rating</Typography>
                        <Rating readOnly value={feedback.rating}/>
                    </Grid>
                    <Grid size={2}>
                        <Typography variant="subtitle2">Additional Comments</Typography>
                        <Typography variant="body2">{feedback.comments}</Typography>
                    </Grid>
                    {feedback.status !== "PENDING" && <Grid size={2}>
                        <Typography variant="subtitle2">Staff Comments</Typography>
                        <Typography variant="body2">{feedback.staff_comments || 'N/A'}</Typography>
                    </Grid>}
                </Grid>
                {admin && <FeedbackDecisionForm feedback={feedback}/>}
            </CardContent>
        </Card>)
    );
}
