'use client';
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {usePublishEventPositions, useUpdateEventPosition} from "@/lib/osmium/hooks/events";

export default function EventPositionPublishAllButton({eventId, positions, archived}: {
    eventId: string,
    positions: { id: string, published: boolean }[],
    archived?: boolean,
}) {

    const publishAll = usePublishEventPositions(eventId);
    const updatePosition = useUpdateEventPosition(eventId);

    const allPublished = positions.length > 0 && positions.every((position) => position.published);

    const handleClick = async () => {
        try {
            if (allPublished) {
                await Promise.all(positions.map((position) =>
                    updatePosition.mutateAsync({positionId: position.id, body: {published: false}})));
                toast.success('All positions unpublished successfully!');
            } else {
                await publishAll.mutateAsync();
                toast.success('All positions published successfully!');
            }
        } catch {
            toast.error('Failed to update positions.');
        }
    }

    return (
        <Button variant={allPublished ? 'outlined' : 'contained'} color={allPublished ? 'error' : 'success'}
                disabled={!!archived || positions.length === 0} onClick={handleClick}>
            {allPublished ? 'Unp' : 'P'}ublish All
        </Button>
    )
}
