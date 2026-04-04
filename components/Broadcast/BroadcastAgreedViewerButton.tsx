'use client';
import React, {useState} from 'react';
import {ChangeBroadcast, User} from "@/generated/prisma/browser";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Check} from "@mui/icons-material";
import {getRating} from "@/lib/vatsim";
import Link from "next/link";

export default function BroadcastAgreedViewerButton({broadcast, agreedBy}: {
    broadcast: ChangeBroadcast,
    agreedBy: User[],
}) {

    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip title="View Controllers Reviewed">
                <GridActionsCellItem
                    icon={<Check/>}
                    label="View Controllers Reviewed"
                    onClick={() => setOpen(true)}
                />
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Agreed - {broadcast.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>Click on a controller to view profile in a new tab.</DialogContentText>
                    <DialogContentText gutterBottom>The following controllers have reviewed this
                        broadcast:</DialogContentText>
                    <ul>
                        {agreedBy
                            .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''))
                            .map((user) => (
                                <li key={user.id}>
                                    <Link href={`/admin/controller/${user.cid}`} style={{textDecoration: 'none',}}
                                          target="_blank">
                                        <DialogContentText>{user.firstName} {user.lastName} - {getRating(user.rating)}</DialogContentText>
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}