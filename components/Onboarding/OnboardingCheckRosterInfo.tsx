'use client';
import React, {useEffect, useState} from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import {ArrowBack, Check, Close} from "@mui/icons-material";
import {formatZuluDate} from "@/lib/date";
import {fetchCertifications} from "@/actions/certifications";
import {CertificationOption} from "@/generated/prisma/enums";
import {getIconForCertificationOption} from "@/lib/certification";

export default function OnboardingCheckRosterInfo({user, moveNext, moveBack}: OnboardingStepProps) {
    const [noResponse, setNoResponse] = useState(false);
    const [certifications, setCertifications] = useState<{
        certification: string,
        status: CertificationOption,
    }[] | null>(null);

    useEffect(() => {
        fetchCertifications(user.cid).then((certs) => {
            setCertifications(certs);
        });
    }, []);

    return (
        <>
            <Dialog fullWidth maxWidth="xs" open={noResponse} onClose={() => setNoResponse(false)}>
                <DialogTitle>Information not correct?</DialogTitle>
                <DialogContent>
                    <DialogContentText>If you just joined the facility, it might take up to 48 hours for the roster to
                        update automatically. Some certifications must be manually assigned, which could take
                        longer.</DialogContentText>
                    <br/>
                    <DialogContentText>If your roster information is still incorrect after five days, contact senior
                        staff.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size="small" variant="contained" onClick={() => setNoResponse(false)}>Ok</Button>
                </DialogActions>
            </Dialog>
            <Stack direction="column" spacing={2} sx={{width: '100%',}}>
                <Typography variant="h5">Is this information correct?</Typography>
                <Grid container columns={2} spacing={2}>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>Roster Status</Typography>
                        <Typography>{user.controllerStatus}</Typography>
                    </Grid>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>Facility Join Date (since suspension if
                            applicable)</Typography>
                        <Typography>{formatZuluDate(user.joinDate)}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <Typography sx={{fontWeight: 'bold',}}>Roster Certifications (hover for detail)</Typography>
                        {!certifications && <CircularProgress/>}
                        {certifications && certifications.length === 0 &&
                            <Typography>No certifications found.</Typography>}
                        {certifications && certifications.length > 0 && certifications.map((cert, i) =>
                            <Stack key={i} direction="row" sx={{alignItems: 'center', mb: 1,}} spacing={1}>
                                <Typography>{cert.certification}:</Typography>
                                {getIconForCertificationOption(cert.status)}
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            </Stack>
            <Box>
                <Button variant="outlined" color="inherit" startIcon={<ArrowBack/>} onClick={moveBack}
                        sx={{mr: 2,}}>Back</Button>
                <Button variant="contained" startIcon={<Close/>} onClick={() => setNoResponse(true)}
                        sx={{mr: 2,}}>No</Button>
                <Button variant="contained" startIcon={<Check/>} onClick={moveNext}>Yes</Button>
            </Box>
        </>

    );

}