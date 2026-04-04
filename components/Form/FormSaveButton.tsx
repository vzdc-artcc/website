'use client';
import React from 'react';
import {Save} from "@mui/icons-material";
import {useFormStatus} from 'react-dom'
import {Button} from "@mui/material";

export default function FormSaveButton({text = "Save", icon = <Save/>}: { text?: string, icon?: React.ReactNode }) {

    const { pending } = useFormStatus();

    return (
        <Button type="submit" loading={pending} variant="contained" size="large" startIcon={icon}>
            {text}
        </Button>
    );
}