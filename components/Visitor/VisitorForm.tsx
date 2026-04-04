'use client';
import React from 'react';
import {Checkbox, FormControlLabel, Grid, Stack, TextField, Typography} from "@mui/material";
import {toast} from "react-toastify";
import {addVisitingApplication} from "@/actions/visitor";
import {useRouter} from "next/navigation";
import {User} from "next-auth";
import {getRating} from "@/lib/vatsim";
import VisitorFormSubmitButton from "@/components/Visitor/VisitorFormSubmitButton";

export default function VisitorForm({user}: { user: User, }) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {

        const {errors} = await addVisitingApplication(formData);

        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: "error"});
            return;
        }

        router.push('/visitor/success');
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="userId" value={user.id}/>
            <Grid container spacing={2} rowSpacing={4} columns={2}>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="name" label="Full Name" defaultValue={user.fullName}
                               disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="cid" label="VATSIM CID" defaultValue={user.cid}
                               disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="rating" label="Rating"
                               defaultValue={getRating(user.rating)} disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="email" label="Email" defaultValue={user.email}
                               disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="homeFacility" label="Home ARTCC/FIR"/>
                </Grid>
                <Grid size={2}>
                    <TextField variant="filled" multiline rows={4} fullWidth name="whyVisit"
                               label="Why would you like to visit the Virtual Washington ARTCC?"/>
                </Grid>
                <Grid size={2}>
                    <Stack direction="column" spacing={1}>
                        <Typography>Before submitting your application, you agree that:</Typography>
                        <FormControlLabel control={<Checkbox name="meetUsaReqs"/>}
                                          label="You meet the VATUSA visiting requirements"/>
                        <FormControlLabel control={<Checkbox name="meetZdcReqs"/>}
                                          label="You agree to our visiting policy"/>
                        <FormControlLabel control={<Checkbox name="goodStanding"/>}
                                          label="You are in good standing with your home ARTCC"/>
                        <FormControlLabel control={<Checkbox name="notRealWorld"/>}
                                          label="You understand that we are not the real world FAA nor do we have any affiliation with them"/>
                        <VisitorFormSubmitButton />
                    </Stack>
                </Grid>
            </Grid>
        </form>)
    );
}