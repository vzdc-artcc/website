'use client';
import React from 'react';
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";

export default function InnovationLabDeleteButton({id}: { id: string }) {
    return (
        <IconButton><Delete/></IconButton>
    );
}