// components/Feedback/FeedbackForm.tsx
"use client";
import React, {useState} from 'react';
import {Autocomplete, Box, Grid, Rating, TextField, Typography} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useGoogleReCaptcha} from "react-google-recaptcha-v3";
import FeedbackFormSubmitButton from "@/components/Feedback/FeedbackFormSubmitButton";
import {checkCaptcha} from "@/lib/captcha";
import Form from "next/form";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useCreateFeedback} from "@/lib/osmium/hooks/feedback";
import {useMe} from "@/lib/osmium/hooks/me";

const groupedPositions = [
    {
        group: 'Center', options: [
            'DC_32_CTR',
            'DC_12_CTR',
            'DC_19_CTR',
            'DC_CTR',
        ]
    },
    {
        group: 'Approach/Departure', options:
            ['PCT_APP',
                'IAD_APP',
                'DCA_APP',
                'BWI_APP',
                'ORF_APP',
                'RIC_APP',
                'RDU_APP',
                'IAD_DEP',
                'DCA_DEP',
                'BWI_DEP',
                'ORF_DEP',
                'RIC_DEP',
                'RDU_DEP',
            ]
    },
    {
        group: 'Tower', options: [
            'IAD_TWR',
            'DCA_TWR',
            'BWI_TWR',
            'ORF_TWR',
            'RIC_TWR',
            'RDU_TWR',
        ]
    },
    {
        group: 'Ground', options: [
            'IAD_GND',
            'DCA_GND',
            'BWI_GND',
            'ORF_GND',
            'RIC_GND',
            'RDU_GND',
        ]
    },
    {
        group: 'Delivery', options: [
            'IAD_DEL',
            'DCA_DEL',
            'BWI_DEL',
            'ORF_DEL',
            'RIC_DEL',
            'RDU_DEL',
        ]
    },
];

export default function FeedbackForm() {

    const router = useRouter();
    const {data: me} = useMe();
    const {executeRecaptcha,} = useGoogleReCaptcha();
    const {data: controllersData} = useRosterControllers();
    const createFeedback = useCreateFeedback();
    const [controllerCid, setControllerCid] = useState<number | null>(null);
    const [controllerPosition, setControllerPosition] = useState('');

    const controllers = (controllersData?.items ?? [])
        .filter((item) => item.basic.cid !== me?.cid)
        .sort((a, b) => a.basic.name.localeCompare(b.basic.name));

    const handleSubmit = async (formData: FormData) => {

        const recaptchaToken = await executeRecaptcha?.('submit_feedback');
        await checkCaptcha(recaptchaToken);

        if (!controllerCid) {
            toast('Please select a controller.', {type: 'error'});
            return;
        }
        if (!controllerPosition) {
            toast('Please select or enter a position.', {type: 'error'});
            return;
        }

        const pilotCallsign = (formData.get('pilotCallsign') as string || '').trim();
        const rating = parseInt(formData.get('rating') as string);
        const comments = (formData.get('comments') as string || '').trim();

        if (!pilotCallsign) {
            toast('Please enter your callsign.', {type: 'error'});
            return;
        }
        if (!rating) {
            toast('Please select a rating.', {type: 'error'});
            return;
        }

        try {
            await createFeedback.mutateAsync({
                target_cid: controllerCid,
                pilot_callsign: pilotCallsign,
                controller_position: controllerPosition,
                rating,
                comments: comments || null,
            });
        } catch {
            toast('Failed to submit feedback.', {type: 'error'});
            return;
        }

        router.push('/feedback/success');
    }

    return (
        (<Box sx={{mt: 2,}}>
            <Form action={handleSubmit}>
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
                        <TextField fullWidth variant="filled" name="pilotCallsign" label="Your Callsign" required/>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Autocomplete
                            fullWidth
                            options={controllers}
                            getOptionLabel={(option) => `${option.basic.name} (${option.basic.cid})`}
                            value={controllers.find((c) => c.basic.cid === controllerCid) || null}
                            onChange={(event, newValue) => {
                                setControllerCid(newValue ? newValue.basic.cid : null);
                            }}
                            renderInput={(params) => <TextField {...params} required label="Controller"/>}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <Autocomplete
                            freeSolo
                            fullWidth
                            options={groupedPositions.flatMap(group => group.options)}
                            groupBy={(option) => groupedPositions.find(group => group.options.includes(option))?.group || ''}
                            value={controllerPosition}
                            onChange={(event, newValue) => {
                                setControllerPosition(newValue || '');
                            }}
                            onInputChange={(event, newInputValue) => {
                                setControllerPosition(newInputValue);
                            }}
                            renderInput={(params) => <TextField {...params}
                                                                helperText="You can pick from the selections OR type in a custom position."
                                                                label="Position Staffed" required/>}
                        />
                    </Grid>
                    <Grid size={2}>
                        <Typography component="legend">Rating*</Typography>
                        <Rating
                            name="rating"
                        />
                    </Grid>
                    <Grid size={2}>
                        <TextField fullWidth multiline rows={5} variant="filled" name="comments"
                                   label="Additional Comments"/>
                    </Grid>
                    <Grid size={2}>
                        <FeedbackFormSubmitButton/>
                    </Grid>
                </Grid>
            </Form>
        </Box>)
    );
}
