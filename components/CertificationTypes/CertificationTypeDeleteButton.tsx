'use client';
import React, {useState} from 'react';
import {Delete} from "@mui/icons-material";
import {IconButton} from "@mui/material";
import {deleteCertificationType} from "@/actions/certificationTypes";
import {toast} from "react-toastify";
import {CertificationType} from "@prisma/client";

export default function CertificationTypeDeleteButton({certificationType}: { certificationType: CertificationType }) {

    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteCertificationType(certificationType.id);
            toast(`Certification type '${certificationType.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting '${certificationType.name}' will remove this certification from ALL controllers and remove all solo endorsements.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}