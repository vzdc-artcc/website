'use client';
import React, {useEffect, useState} from 'react';
import {CertificationType, LessonRosterChange, OtsRecommendation, TrainerReleaseRequest} from "@prisma/client";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack} from "@mui/material";
import {ArrowForward} from "@mui/icons-material";

export type RosterChangeWithAll = LessonRosterChange & {
    certificationType: CertificationType,
}

export default function TrainingSessionAfterSubmitDialogs({release, rosterChanges, otsRec, onAllClose}: {
    release?: TrainerReleaseRequest,
    rosterChanges?: RosterChangeWithAll[],
    otsRec?: OtsRecommendation,
    onAllClose: () => void
}) {

    const [releaseDialogOpen, setReleaseDialogOpen] = useState(!!release);
    const [rosterDialogOpen, setRosterDialogOpen] = useState(!!rosterChanges && rosterChanges.length > 0);
    const [otsRecDialogOpen, setOtsRecDialogOpen] = useState(!!otsRec);

    useEffect(() => {
        if (!releaseDialogOpen && !rosterDialogOpen && !otsRecDialogOpen) {
            onAllClose();
        }
    }, [releaseDialogOpen, rosterDialogOpen, otsRecDialogOpen, onAllClose]);

    return (
        <>
            <Dialog open={otsRecDialogOpen} onClose={() => setOtsRecDialogOpen(false)}>
                <DialogTitle>OTS Recommendation Submitted</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2,}}>One or more lessons in this session are configured to automatically
                        submit an OTS recommendation upon passing.</DialogContentText>
                    <DialogContentText><b>Inform the student that an OTS recommendation has been submitted and to wait
                        for an instructor to be assigned. The student should have received an
                        email.</b></DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOtsRecDialogOpen(false)} variant="contained"
                            size="small">OK</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={releaseDialogOpen} onClose={() => setReleaseDialogOpen(false)}>
                <DialogTitle>Trainer Release Request Submitted</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2,}}>One or more lessons in this session are configured to automatically
                        submit a trainer release request upon passing.</DialogContentText>
                    <DialogContentText><b>Inform the student that a trainer release request has been
                        submitted.</b></DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReleaseDialogOpen(false)} variant="contained"
                            size="small">OK</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={rosterDialogOpen} onClose={() => setRosterDialogOpen(false)}>
                <DialogTitle>Roster Updates Processed</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2,}}>The following roster updates were made for this student as a result
                        of passing one or more lessons during this session:</DialogContentText>
                    <ul>
                        {(rosterChanges || []).map((update) => (
                            <li key={update.id}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <DialogContentText
                                        color="textPrimary">{update.certificationType.name}</DialogContentText>
                                    <ArrowForward/>
                                    <DialogContentText
                                        color="textPrimary">{update.certificationOption}</DialogContentText>
                                </Stack>
                            </li>
                        ))}
                    </ul>
                    <DialogContentText sx={{mt: 2,}}>Please inform the student of these changes.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRosterDialogOpen(false)} variant="contained"
                            size="small">OK</Button>
                </DialogActions>
            </Dialog>
        </>
    );

}