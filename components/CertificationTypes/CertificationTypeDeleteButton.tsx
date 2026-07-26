'use client';
import React, {useState} from 'react';
import {Delete} from "@mui/icons-material";
import {IconButton} from "@mui/material";
import {toast} from "react-toastify";
import {useDeleteCertificationType} from "@/lib/osmium/hooks/certifications";

export default function CertificationTypeDeleteButton({certificationType}: {
    certificationType: { id: string; name: string }
}) {

    const [clicked, setClicked] = useState(false);
    const deleteType = useDeleteCertificationType();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteType.mutateAsync(certificationType.id);
                toast(`Certification type '${certificationType.name}' deleted successfully!`, {type: 'success'});
            } catch {
                toast(`Failed to delete '${certificationType.name}'.`, {type: 'error'});
            }
            setClicked(false);
        } else {
            toast(`Deleting '${certificationType.name}' will remove this certification from ALL controllers and remove all solo endorsements.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }
    }

    return (
        <IconButton onClick={handleClick} disabled={deleteType.isPending}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}
