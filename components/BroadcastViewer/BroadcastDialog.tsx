'use client';
import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack
} from "@mui/material";
import {Check} from "@mui/icons-material";
import {usePathname} from "next/navigation";
import {useMarkBroadcastAgreed, useMarkBroadcastSeen} from "@/lib/osmium/hooks/broadcasts";

interface PendingBroadcast {
    id: string;
    title: string;
}

export default function BroadcastDialog({broadcasts, children}: {
    broadcasts: PendingBroadcast[],
    children: React.ReactNode
}) {

    const pathname = usePathname();
    const markSeen = useMarkBroadcastSeen();
    const markAgreed = useMarkBroadcastAgreed();
    const [open, setOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<null | 'later' | 'reviewed'>(null);

    useEffect(() => {
        setOpen(!pathname.startsWith("/publications"));
    }, [pathname]);

    const handleClose = () => {
        setConfirmAction('later');
    }

    const handleAgree = () => {
        setConfirmAction('reviewed');
    }

    const handleConfirm = async () => {
        if (confirmAction === 'later') {
            await Promise.all(broadcasts.map((b) => markSeen.mutateAsync(b.id)));
        } else if (confirmAction === 'reviewed') {
            await Promise.all(broadcasts.map((b) => markAgreed.mutateAsync(b.id)));
        }
        setConfirmAction(null);
        setOpen(false);
    }

    const handleCancelConfirm = () => {
        setConfirmAction(null);
    }

    return (
        <>
            <Dialog open={open} fullScreen>
                <DialogTitle>{broadcasts.length > 1 ? 'New Facility Broadcasts' : broadcasts[0].title}</DialogTitle>
                <DialogContent>
                    <Alert severity="info">Reviewing facility broadcasts is a <b>requirement</b> to maintain currency
                        and is actively tracked.</Alert>
                    {children}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">Save for Later</Button>
                    <Button onClick={handleAgree} variant="contained" startIcon={<Check/>}>Reviewed</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmAction !== null}
                onClose={handleCancelConfirm}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{confirmAction === 'later' ? 'Save for later?' : 'Mark as reviewed?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText gutterBottom>
                        {confirmAction === 'later'
                            ? 'This will mark the broadcasts as seen for your account, but not reviewed. You will be able to see this broadcast along with others in your profile. Continue?'
                            : 'By clicking "Reviewed", you agree that you have fully reviewed and understood the contents of the broadcast(s).  This cannot be undone.'
                        }
                    </DialogContentText>
                    <Stack direction="column" spacing={2}>
                        {confirmAction === "later" && <Alert severity="warning">
                            Fully reviewing all broadcasts is required for quarterly facility
                            currency. Saving for later <b>does not satisfy this requirement</b>.
                        </Alert>}
                        {confirmAction === "reviewed" && <Alert severity="error">
                            <b>Not fully viewing a facility broadcast is against the GOAP.</b> Mark the broadcast as
                            saved for later if you do not want to view it now.
                        </Alert>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelConfirm} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirm} variant="contained" startIcon={<Check/>}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
