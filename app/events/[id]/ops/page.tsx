'use client';
import React from 'react';
import {Box, CircularProgress, Divider, Paper, Typography} from "@mui/material";
import OpsPlanView from "@/components/OpsPlan/OpsPlanView";
import OpsPlanFiles from "@/components/OpsPlan/OpsPlanFiles";
import {useParams} from "next/navigation";
import {useEvent, useEventOpsPlan} from "@/lib/osmium/hooks/events";

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data: event, isLoading} = useEvent(params.id);
    const {data: opsPlan} = useEventOpsPlan(params.id);

    if (isLoading || !opsPlan) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (!event || event.hidden || event.archived_at) {
        return <Typography textAlign="center" variant="h5" sx={{mt: 4}}>Event not found.</Typography>;
    }

    if (opsPlan.ops_plan_published) {
        return (
            <Box sx={{px: 2, py: 3}}>
                <Paper elevation={2} sx={{p: 4}}>
                    <OpsPlanView eventId={event.id}/>
                    <Divider sx={{my: 2}}/>
                    <Box sx={{mt: 3}}>
                        <OpsPlanFiles eventId={event.id}/>
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{px: 2, py: 6, display: "flex", justifyContent: "center"}}>
            <Paper elevation={1} sx={{maxWidth: 900, width: "100%", p: 4}}>
                <Typography variant="h5" gutterBottom>
                    OPS Plan Not Published
                </Typography>
                <Typography variant="body1" sx={{mt: 1}}>
                    The OPS Plan for {event.title} has not been published yet.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                    Event staff are still preparing the OPS Plan. Once the OPS Plan is published it will be available
                    here for you to view. If you believe this is an error or you need access sooner, please contact
                    the event organizers.
                </Typography>
            </Paper>
        </Box>
    );
}
