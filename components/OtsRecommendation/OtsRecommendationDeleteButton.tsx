'use client';
import { useState } from 'react';
import { toast } from "react-toastify";
import { IconButton, Tooltip } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useDeleteOtsRecommendation } from "@/lib/osmium/hooks/training";

export default function OtsRecommendationDeleteButton({ recommendationId }: { recommendationId: string }) {
    const [clicked, setClicked] = useState(false);
    const deleteOts = useDeleteOtsRecommendation();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteOts.mutateAsync(recommendationId);
                toast.success('Recommendation deleted successfully!');
            } catch {
                toast.error('Failed to delete recommendation.');
            }
        } else {
            toast.warn(`Deleting this recommendation is not reversable. Click again to confirm.`);
            setClicked(true);
        }
    }

    return (
        <Tooltip title="Delete Recommendation">
            <IconButton onClick={handleClick}>
                <Delete color={clicked ? "warning" : "inherit"} />
            </IconButton>
        </Tooltip>
    );
}
