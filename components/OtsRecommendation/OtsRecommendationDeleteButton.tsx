'use client';
import React, {useState} from 'react';
import {OtsRecommendation} from "@prisma/client";
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteOtsRec} from "@/actions/ots";

export default function OtsRecommendationDeleteButton({rec}: { rec: OtsRecommendation }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteOtsRec(rec.id);
            toast('Recommendation deleted successfully!', {type: 'success'});
        } else {
            toast.warn(`The student and instructor will receive an email regarding this deletion.  Click again to confirm.`);
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Recommendation">
            <IconButton onClick={handleClick}>
                <Delete color={clicked ? "warning" : "inherit"}/>
            </IconButton>
        </Tooltip>
    );
}