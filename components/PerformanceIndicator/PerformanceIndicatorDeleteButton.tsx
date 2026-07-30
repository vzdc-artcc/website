'use client';
import {Delete} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useState} from "react";
import {toast} from "react-toastify";
import {useDeletePerformanceIndicatorTemplate} from "@/lib/osmium/hooks/training";

export default function PerformanceIndicatorDeleteButton({performanceIndicator}: {
    performanceIndicator: { id: string, name: string }
}) {
    const [clicked, setClicked] = useState(false);
    const deleteTemplate = useDeletePerformanceIndicatorTemplate();

    const handleClick = async () => {
        if (clicked) {
            await deleteTemplate.mutateAsync(performanceIndicator.id);
            toast(`Performance Indicator '${performanceIndicator.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast.warn(`Deleting this performance indicator will remove all categories and criteria associated with it.  It will also remove it from any lessons and training sessions created in the future.  Click again to confirm.`);
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Performance Indicator">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Performance Indicator"
                onClick={handleClick}
            />
        </Tooltip>
    );
}
