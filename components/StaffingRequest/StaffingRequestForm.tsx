'use client';
import React from 'react';
import {Grid, TextField} from "@mui/material";
import RequestSubmitButton from "@/components/StaffingRequest/RequestSubmitButton";
import {toast} from "react-toastify";
import {useCreateStaffingRequest} from "@/lib/osmium/hooks/staffing";
import {useRouter} from "next/navigation";
import {useMe} from "@/lib/osmium/hooks/me";

export default function StaffingRequestForm() {

    const {data: me} = useMe();

    const router = useRouter();
    const createStaffingRequest = useCreateStaffingRequest();

    const handleSubmit = async (formData: FormData) => {

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        if (!name || !description) {
            toast('Event name and description are required.', {type: 'error'});
            return;
        }

        try {
            await createStaffingRequest.mutateAsync({name, description});
        } catch {
            toast('Failed to submit staffing request.', {type: 'error'});
            return;
        }
        router.push(`/staffing/success`);
    }

    return (
        (<form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="pilotName" label="Your Name"
                               defaultValue={me?.display_name} disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="pilotEmail" label="Your Email"
                               defaultValue={me?.email} disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="pilotCid" label="Your VATSIM CID"
                               defaultValue={me?.cid} disabled/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="name" label="Event Name" required/>
                </Grid>
                <Grid size={2}>
                    <TextField fullWidth required multiline rows={5} variant="filled" name="description"
                               label="Description"
                               helperText="Include airports, times, routes, and any other staffing requirements needed."/>
                </Grid>
                <Grid size={2}>
                    <RequestSubmitButton/>
                    
                </Grid>
            </Grid>
        </form>)
    );
}