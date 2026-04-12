'use client';
import React from 'react';
import {Feedback} from "@/generated/prisma/browser";
import {Box, Button, Divider, Stack, TextField} from "@mui/material";
import {Delete, Send} from "@mui/icons-material";
import {toast} from "react-toastify";
import {releaseFeedback, stashFeedback} from "@/actions/feedback";

export default function FeedbackDecisionForm({feedback}: { feedback: Feedback, }) {
    const [staffComments, setStaffComments] = React.useState(feedback.staffComments || '');

    const handleRelease = async (formData: FormData) => {
        await releaseFeedback({...feedback, staffComments: formData.get("reason") as string});
        toast("Feedback released successfully!", {type: "success"});
    }

    const handleStash = async () => {
        if (!staffComments.trim()) {
            toast("Staff comments are required when stashing feedback", {type: "error"});
            return;
        }
        await stashFeedback({...feedback, staffComments});
        toast("Feedback stashed successfully!", {type: "success"});
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