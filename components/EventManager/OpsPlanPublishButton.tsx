'use client';

import React from 'react';
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useEventOpsPlan, useUpdateEventOpsPlan} from "@/lib/osmium/hooks/events";

export default function OpsPlanPublishButton({eventId}: { eventId: string }) {
    const {data: opsPlan} = useEventOpsPlan(eventId);
    const updateOpsPlan = useUpdateEventOpsPlan(eventId);
    const published = !!opsPlan?.ops_plan_published;

    const handleClick = async () => {
        try {
            await updateOpsPlan.mutateAsync({ops_plan_published: !published});
            toast.success(published ? 'OPS Plan unpublished' : 'OPS Plan published');
        } catch {
            toast.error('Failed to update OPS Plan publish state');
        }
    };

    return (
        <Button
            variant="outlined"
            color={published ? 'info' : 'warning'}
            onClick={handleClick}
        >
            {published ? 'Unpublish OPS Plan' : 'Publish OPS Plan'}
        </Button>
    );
}
