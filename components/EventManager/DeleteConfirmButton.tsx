'use client';

import React, {useRef, useState} from 'react';
import {IconButton, CircularProgress} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {toast} from 'react-toastify';
import {useRouter} from 'next/navigation';

type Props = {
    id: string;
    deleteFunction: (id: string) => Promise<any>;
    onSuccess?: () => void;
    warningMessage?: string;
};

export default function DeleteConfirmButton({
                                                id,
                                                deleteFunction,
                                                onSuccess,
                                                warningMessage = 'Are you sure you want to delete this? Click again to confirm.',
                                            }: Props) {
    const [clicked, setClicked] = useState(false);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<number | null>(null);
    const router = useRouter();

    const reset = () => {
        setClicked(false);
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleClick = async () => {
        if (loading) return;

        if (!clicked) {
            setClicked(true);
            toast.warning(warningMessage);
            timerRef.current = window.setTimeout(() => {
                reset();
            }, 5000);
            return;
        }

        setLoading(true);
        try {
            await deleteFunction(id);
            toast.success('Deleted');
            if (onSuccess) onSuccess();
            router.refresh();
        } catch (err: any) {
            console.error('Delete error', err);
            const message = err?.message || 'Failed to delete';
            toast.error(message);
        } finally {
            setLoading(false);
            reset();
        }
    };

    return (
        <IconButton
            onClick={handleClick}
            size="small"
            aria-label="Delete"
            sx={{
                color: clicked ? 'warning.main' : 'inherit',
            }}
            title="Delete file"
        >
            <DeleteIcon />
        </IconButton>
    );
}
