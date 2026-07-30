'use client';
import React from 'react';
import {Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, {Dayjs} from "dayjs";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useCertificationTypes, useCreateSoloCertification} from "@/lib/osmium/hooks/certifications";

export default function SoloForm() {

    const router = useRouter();
    const {data: rosterData} = useRosterControllers();
    const {data: typesData} = useCertificationTypes();
    const create = useCreateSoloCertification();

    const controllers = rosterData?.items ?? [];
    const soloTypes = (typesData?.items ?? []).filter((t) => t.can_solo_cert);

    const [controllerUserId, setControllerUserId] = React.useState<string | null>(null);
    const [certType, setCertType] = React.useState('');
    const [position, setPosition] = React.useState('');
    const [expires, setExpires] = React.useState<Dayjs | null>(dayjs().add(1, "month"));

    const handleSubmit = async () => {
        if (!controllerUserId) { toast.error('Please select a controller.'); return; }
        if (!certType) { toast.error('Please select a certification type.'); return; }
        if (!position.trim()) { toast.error('Position is required.'); return; }
        if (!expires) { toast.error('Expiry is required.'); return; }
        try {
            await create.mutateAsync({
                user_id: controllerUserId,
                certification_type_id: certType,
                position: position.trim(),
                expires: expires.toISOString(),
            });
            toast('Solo endorsement added', {type: 'success'});
            router.push('/training/solos');
        } catch {
            toast.error('Failed to add solo endorsement.');
        }
    };

    return (
        (<LocalizationProvider dateAdapter={AdapterDayjs}>
            <form action={handleSubmit}>
                <Grid container columns={2} spacing={2}>
                    <Grid size={{xs: 2, md: 1}}>
                        <Autocomplete
                            renderInput={(params) => <TextField {...params} label="Controller"/>}
                            options={controllers}
                            getOptionLabel={(option) => `${option.basic.name} (${option.basic.cid})`}
                            getOptionKey={(option) => option.basic.cid}
                            isOptionEqualToValue={(a, b) => a.basic.cid === b.basic.cid}
                            onChange={(event, value) => setControllerUserId(value?.full?.id ?? null)}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{xs: 2, md: 1}}>
                        <FormControl fullWidth>
                            <InputLabel id="ct-select-label">Certification Type</InputLabel>
                            <Select
                                labelId="ct-select-label"
                                id="ct-select"
                                label="Certification Type"
                                value={certType}
                                onChange={(e) => setCertType(e.target.value)}
                                required
                                variant="filled">
                                {soloTypes.map((certificationType) => (
                                    <MenuItem key={certificationType.id}
                                              value={certificationType.id}>{certificationType.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 2, md: 1}}>
                        <TextField fullWidth variant="filled" label="Position" required value={position}
                                   onChange={(e) => setPosition(e.target.value)}/>
                    </Grid>
                    <Grid size={{xs: 2, md: 1}}>
                        <DateTimePicker ampm={false} value={expires} onChange={setExpires}/>
                    </Grid>
                    {soloTypes.length === 0 &&
                        <Grid size={2}>
                            <Typography color="error">No certification types allow solo endorsement. Enable
                                &quot;Can get solo certified&quot; on a certification type first.</Typography>
                        </Grid>}
                    <Grid size={2}>
                        <FormSaveButton/>
                    </Grid>
                </Grid>
            </form>
        </LocalizationProvider>)
    );
}
