'use client';
import {Publish, Unpublished} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {useUpdateEventPosition} from "@/lib/osmium/hooks/events";

export default function EventPositionPublishButton({eventId, position}: {
    eventId: string,
    position: { id: string, published: boolean },
}) {

    const updatePosition = useUpdateEventPosition(eventId);

    const handleClick = async () => {
        try {
            await updatePosition.mutateAsync({positionId: position.id, body: {published: !position.published}});
            toast.success(`Position ${position.published ? 'unpublished' : 'published'} successfully!`);
        } catch {
            toast.error('Failed to update position.');
        }
    }

    return (
        <Tooltip title={`${position.published ? 'Unp' : 'P'}ublish Position`}>
            <IconButton onClick={handleClick}>
                {position.published ? <Unpublished/> : <Publish/>}
            </IconButton>
        </Tooltip>
    );
}
