'use client';
import React, {useState} from 'react';
import {GridActionsCellItem} from "@mui/x-data-grid";
import {toast} from "react-toastify";
import {Delete} from "@mui/icons-material";

export default function TmiDeleteButton<T>({
                                            label,
                                            warningMessage,
                                            id,
                                            deleteFunction,
                                            onSuccess,
                                        }: {
    label: string,
    warningMessage?: string,
    id: T,
    deleteFunction: (key: T) => Promise<any>,
    onSuccess?: () => void
}) {
    const [clicked, setClicked] = useState(false);

    const handleDelete = async () => {
        if (clicked) {
            try {
                await deleteFunction(id);
                if (onSuccess) onSuccess();
            } catch (err: any) {
                console.error('DeleteButton error', err);
                toast.error(err?.message || 'Failed to delete');
            } finally {
                setClicked(false);
            }
        } else {
            if (warningMessage) {
                toast(warningMessage, {type: 'warning'});
            } else {
                toast.warn('Click delete again to confirm');
            }
            setClicked(true);
        }
    };

    return (
        <GridActionsCellItem
            icon={<Delete color={clicked ? "warning" : "inherit"} />}
            label={label}
            onClick={handleDelete}
        />
    );
}
