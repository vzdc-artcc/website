'use client';
import React from 'react';
import {Checkbox, FormControlLabel, Grid, Stack, TextField, Typography} from "@mui/material";
import {toast} from "react-toastify";
import {useCreateVisitorApplication} from "@/lib/osmium/hooks/visitor";
import {useRouter} from "next/navigation";
import {useMe} from "@/lib/osmium/hooks/me";
import VisitorFormSubmitButton from "@/components/Visitor/VisitorFormSubmitButton";

export default function VisitorForm() {

    const router = useRouter();
    const {data: me} = useMe();
    const createVisitorApplication = useCreateVisitorApplication();

    const handleSubmit = async (formData: FormData) => {

        const homeFacility = (formData.get("homeFacility") as string || '').trim();
        const whyVisit = (formData.get("whyVisit") as string || '').trim();

        if (!homeFacility) {
            toast("Home ARTCC is required", {type: "error"});
            return;
        }
        if (!whyVisit) {
            toast("Reason for visiting is required", {type: "error"});
            return;
        }
        for (const [field, message] of [
            ["meetUsaReqs", "You must meet the VATUSA visiting requirements"],
            ["meetZdcReqs", "You must agree to our visiting policy"],
            ["goodStanding", "You must be in good standing with your home ARTCC"],
            ["notRealWorld", "You must understand that we are not the real world FAA nor do we have any affiliation with them"],
        ]) {
            if (formData.get(field) !== 'on') {
                toast(message, {type: "error"});
                return;
            }
        }

        try {
            await createVisitorApplication.mutateAsync({home_facility: homeFacility, why_visit: whyVisit});
        } catch {
            toast("Failed to submit visitor application.", {type: "error"});
            return;
        }

        router.push('/visitor/success');
    }

    return (
        (<form action={handleSubmit}>
            <Grid container spacing={2} rowSpacing={4} columns={2}>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="name" label="Full Name" defaultValue={me?.display_name}
                               disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="cid" label="VATSIM CID" defaultValue={me?.cid}
                               disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="rating" label="Rating"
                               defaultValue={me?.rating ?? ""} disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        lg: 1
                    }}>
                    <TextField variant="filled" fullWidth name="email" label="Email" defaultValue={me?.email}
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