'use client';
import React, {useState} from 'react';
import {CertificationType, Lesson, LessonRosterChange} from "@prisma/client";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Edit} from "@mui/icons-material";
import RosterChangeForm from "@/components/LessonRosterChange/RosterChangeForm";

export default function RosterChangeEditButton({lesson, rosterChange, allCertificationTypes}: {
    lesson: Lesson,
    rosterChange: LessonRosterChange & { certificationType: CertificationType, },
    allCertificationTypes: CertificationType[],
}) {

    const [open, setOpen] = useState(false);


    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Edit Lesson Roster Change</DialogTitle>
                <DialogContent>
                    <Box sx={{pt: 1,}}>
                        <RosterChangeForm
                            lesson={lesson}
                            rosterChange={rosterChange}
                            allCertificationTypes={allCertificationTypes}
                            onSubmit={() => setOpen(false)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <IconButton onClick={() => setOpen(true)}>
                <Edit/>
            </IconButton>
        </>
    );

}