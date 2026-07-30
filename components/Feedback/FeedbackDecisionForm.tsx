'use client';
import React from 'react';
import {Box, Button, Divider, Stack, TextField} from "@mui/material";
import {Delete, Send} from "@mui/icons-material";
import {toast} from "react-toastify";
import {components} from "@/lib/osmium/generated/schema";
import {useDecideFeedback} from "@/lib/osmium/hooks/feedback";

type FeedbackItem = components["schemas"]["FeedbackItem"];

export default function FeedbackDecisionForm({feedback}: { feedback: FeedbackItem, }) {
    const [staffComments, setStaffComments] = React.useState(feedback.staff_comments || '');
    const decideFeedback = useDecideFeedback();

    const handleRelease = async (formData: FormData) => {
        try {
            await decideFeedback.mutateAsync({
                feedbackId: feedback.id,
                status: "RELEASED",
                staffComments: (formData.get("reason") as string) || null,
            });
            toast("Feedback released successfully!", {type: "success"});
        } catch {
            toast("Failed to release feedback", {type: "error"});
        }
    }

    const handleStash = async () => {
        if (!staffComments.trim()) {
            toast("Staff comments are required when stashing feedback", {type: "error"});
            return;
        }
        try {
            await decideFeedback.mutateAsync({
                feedbackId: feedback.id,
                status: "STASHED",
                staffComments,
            });
            toast("Feedback stashed successfully!", {type: "success"});
        } catch {
            toast("Failed to stash feedback", {type: "error"});
        }
    }

    return (
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems="center">
            <Box sx={{width: '100%',}}>
                <form action={handleRelease}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField variant="filled" rows={4} fullWidth multiline name="reason" label="Staff comments"
                                   value={staffComments}
                                   onChange={(e) => setStaffComments(e.target.value)}
                                   helperText="Staff comments are required when stashing, optional when releasing"/>
                        <Box>
                            <Button type="submit" variant="contained" size="large" color="success"
                                    startIcon={<Send/>}>Release</Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
            <Divider orientation="vertical" flexItem/>
            <Box>
                <Button variant="contained" size="large" color="error" startIcon={<Delete/>}
                        onClick={handleStash}>Stash</Button>
            </Box>
        </Stack>
    );

}
