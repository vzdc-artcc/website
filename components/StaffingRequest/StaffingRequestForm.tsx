'use client';
import React from 'react';
import {User} from "next-auth";
import {useGoogleReCaptcha} from "react-google-recaptcha-v3";
import {Grid2, TextField} from "@mui/material";
import RequestSubmitButton from "@/components/StaffingRequest/RequestSubmitButton";
import {toast} from "react-toastify";
import {createStaffingRequest} from "@/actions/staffingRequest";
import {useRouter} from "next/navigation";
import {checkCaptcha} from "@/lib/captcha";

export default function StaffingRequestForm({user}: { user: User, }) {

    const router = useRouter();
    const {executeRecaptcha} = useGoogleReCaptcha();

    const handleSubmit = async (formData: FormData) => {

        const recaptchaToken = await executeRecaptcha?.('submit_feedback');
        await checkCaptcha(recaptchaToken);

        const {errors} = await createStaffingRequest(formData);
        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'});
            return;
        }
        router.push(`/staffing/success`);
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="userId" value={user.id}/>
            <Grid2 container columns={2} spacing={2}>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="pilotName" label="Your Name"
                               defaultValue={user.fullName} disabled/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="pilotEmail" label="Your Email"
                               defaultValue={user.email} disabled/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="pilotCid" label="Your VATSIM CID"
                               defaultValue={user.cid} disabled/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" name="name" label="Event Name" required/>
                </Grid2>
                <Grid2 size={2}>
                    <TextField fullWidth required multiline rows={5} variant="filled" name="description"
                               label="Description"
                               helperText="Include airports, times, routes, and any other staffing requirements needed."/>
                </Grid2>
                <Grid2 size={2}>
                    <RequestSubmitButton/>
                </Grid2>
            </Grid2>
        </form>)
    );
}