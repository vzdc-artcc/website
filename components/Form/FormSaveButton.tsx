'use client';
import React from 'react';
import {Save} from "@mui/icons-material";
import {useFormStatus} from 'react-dom'
import {Button} from "@mui/material";

export default function FormSaveButton({text = "Save", icon = <Save/>, size = "large"}: {
    text?: string,
    icon?: React.ReactNode,
    size?: 'small' | 'medium' | 'large',
}) {

    const { pending } = useFormStatus();

    return (
        <Button type="submit" loading={pending} variant="contained" size={size} startIcon={icon}>
            {text}
        </Button>
    );
}