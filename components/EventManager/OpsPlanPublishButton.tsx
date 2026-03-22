'use client';

import React, {useState} from 'react';
import { setOpsPlanPublished } from "@/actions/eventPosition";
import { Button } from "@mui/material";
import { Event } from "@prisma/client";
import { toast } from "react-toastify";

export default function OpsPlanPublishButton({ event }: { event: Event }) {
    const [published, setPublished] = useState<boolean>(Boolean(event.opsPlanPublished));
    const [loading, setLoading] = useState<boolean>(false);

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.set('eventId', event.id);
            formData.set('publish', published ? 'false' : 'true');

            await setOpsPlanPublished(formData);

            setPublished(!published);

            toast.success(published ? 'OPS Plan unpublished' : 'OPS Plan published');
        } catch (err) {
            console.error("Failed to toggle ops plan published:", err);
            toast.error('Failed to update OPS Plan publish state');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outlined"
            color={published ? 'info' : 'warning'}
            onClick={handleClick}
            disabled={loading}
        >
            {published ? 'Unpublish OPS Plan' : 'Publish OPS Plan'}
        </Button>
    );
}
