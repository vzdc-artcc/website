'use client';
import React, {useState} from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {ArrowBack, Check, Close} from "@mui/icons-material";
import {refreshAccountData} from "@/actions/user";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";

export default function OnboardingCheckUserInfo({user, moveNext, moveBack}: OnboardingStepProps) {
    const [noResponse, setNoResponse] = useState(false);
    const router = useRouter();

    return (
        <>
            <Dialog fullWidth maxWidth="xs" open={noResponse} onClose={() => setNoResponse(false)}>
                <DialogTitle>Information not correct?</DialogTitle>
                <DialogContent>
                    <DialogContentText>The information on this page is sourced directly from VATSIM, therefore it cannot
                        be changed on our end.</DialogContentText>
                    <br/>
                    <DialogContentText>Click the below button to refresh your information from VATUSA. If your
                        information is still incorrect, contact VATUSA or VATSIM.</DialogContentText>
                    <br/>
                    <Button variant="outlined" color="inherit" onClick={() => refreshAccountData(user).then((error) => {
                        if (error) {
                            toast.error(error);
                        } else {
                            router.refresh();
                            toast.success("Account data refreshed successfully.");
                            setNoResponse(false);
                        }
                    })}>Refresh Account Data</Button>
                </DialogContent>
                <DialogActions>
                    <Button size="small" variant="contained" onClick={() => setNoResponse(false)}>Ok</Button>
                </DialogActions>
            </Dialog>
            <Stack direction="column" spacing={2} sx={{width: '100%',}}>
                <Typography variant="h5">Is this information correct?</Typography>
                <Grid container columns={2} spacing={2}>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>First Name</Typography>
                        <Typography>{user.firstName}</Typography>
                    </Grid>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>Last Name</Typography>
                        <Typography>{user.lastName}</Typography>
                    </Grid>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>Full Name</Typography>
                        <Typography>{user.fullName}</Typography>
                    </Grid>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>Email</Typography>
                        <Typography>{user.email}</Typography>
                    </Grid>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>Rating</Typography>
                        <Typography>{getRating(user.rating)}</Typography>
                    </Grid>
                    <Grid size={{xs: 2, md: 1,}}>
                        <Typography sx={{fontWeight: 'bold',}}>VATSIM CID</Typography>
                        <Typography>{user.cid}</Typography>
                    </Grid>
                    {/*<Grid size={{ xs: 2, md: 1, }}>*/}
                    {/*    <Typography sx={{ fontWeight: 'bold', }}>Division</Typography>*/}
                    {/*    <Typography>{user.division}</Typography>*/}
                    {/*</Grid>*/}
                    {/*<Grid size={{ xs: 2, md: 1, }}>*/}
                    {/*    <Typography sx={{ fontWeight: 'bold', }}>Subdivision (ARTCC)</Typography>*/}
                    {/*    <Typography>{user.artcc}</Typography>*/}
                    {/*</Grid>*/}
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