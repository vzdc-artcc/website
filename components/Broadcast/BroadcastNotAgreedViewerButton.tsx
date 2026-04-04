'use client';
import React, {useState} from 'react';
import {ChangeBroadcast, User} from "@/generated/prisma/browser";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Gavel} from "@mui/icons-material";
import {getRating} from "@/lib/vatsim";
import Link from "next/link";

export default function BroadcastNotAgreedViewerButton({broadcast, notAgreedBy}: {
    broadcast: ChangeBroadcast,
    notAgreedBy: User[],
}) {

    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip title="View Controllers NOT Reviewed">
                <GridActionsCellItem
                    icon={<Gavel/>}
                    label="View Controllers NOT Reviewed"
                    onClick={() => setOpen(true)}
                />
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Not Agreed - {broadcast.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>Click on a controller to view profile in a new tab.</DialogContentText>
                    <DialogContentText gutterBottom>The following controllers have not reviewed this
                        broadcast:</DialogContentText>
                    <ul>
                        {notAgreedBy
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