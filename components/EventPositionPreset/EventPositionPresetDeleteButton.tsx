import {deleteEventPreset} from "@/actions/eventPreset";
import {Delete} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {EventPositionPreset} from "@/generated/prisma/browser";
import {useState} from "react";
import {toast} from "react-toastify";

export function EventPositionPresetDeleteButton({ positionPreset }: { positionPreset: EventPositionPreset }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteEventPreset(positionPreset.id);
            toast(`Position preset '${positionPreset.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast.warn(`Deleting this preset is not reversable.  Click again to confirm.`);
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Event Position Preset">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Event Position Preset"
                onClick={handleClick}
            />
        </Tooltip>
    );}