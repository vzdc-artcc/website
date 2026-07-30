'use client';
import React, {useState} from 'react';
import {Grid, TextField} from "@mui/material";
import {Turnstile} from "@marsidev/react-turnstile";
import RequestSubmitButton from "@/components/StaffingRequest/RequestSubmitButton";
import {toast} from "react-toastify";
import {useCreateStaffingRequest} from "@/lib/osmium/hooks/staffing";
import {useRouter} from "next/navigation";
import {checkCaptcha} from "@/lib/captcha";
import {useMe} from "@/lib/osmium/hooks/me";

export default function StaffingRequestForm() {

    const {data: me} = useMe();

    const router = useRouter();
    const createStaffingRequest = useCreateStaffingRequest();
    const [captchaToken, setCaptchaToken] = useState('');

    const handleSubmit = async (formData: FormData) => {

        if (!await checkCaptcha(captchaToken)) {
            return;
        }

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
                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                        onSuccess={setCaptchaToken}
                        onExpire={() => setCaptchaToken('')}
                        onError={() => setCaptchaToken('')}
                    />
                </Grid>
                <Grid size={2}>
                    <RequestSubmitButton/>
                </Grid>
            </Grid>
        </form>)
    );
}