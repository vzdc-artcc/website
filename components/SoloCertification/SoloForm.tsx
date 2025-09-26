'use client';
import React from 'react';
import {User} from "next-auth";
import {Autocomplete, FormControl, Grid2, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {CertificationType} from "@prisma/client";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {addSolo} from "@/actions/solo";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function SoloForm({controllers, certificationTypes,}: {
    controllers: User[],
    certificationTypes: CertificationType[]
}) {

    const router = useRouter();
    const [controller, setController] = React.useState<User | null>(null);


    const handleSubmit = async (formData: FormData) => {

        const error = await addSolo(formData);
        if (error) {
            toast(error.errors.map((e) => e.message).join(".  "), {type: 'error'})
        }

        toast('Solo endorsement added', {type: 'success'});
        router.push('/training/solos');
    };

    return (
        (<LocalizationProvider dateAdapter={AdapterDayjs}>
            <form action={handleSubmit}>
                <Grid2 container columns={2} spacing={2}>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Autocomplete
                            renderInput={(params) => <TextField {...params} label="Controller"/>}
                            options={controllers}
                            getOptionLabel={(option) => option.firstName + ' ' + option.lastName}
                            getOptionKey={(option) => option.id}
                            onChange={(event, value) => setController(value)}
                            fullWidth
                        />
                        <input type="hidden" name="controller" value={controller?.id}/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <FormControl fullWidth>
                            <InputLabel id="ct-select-label">Certification Type</InputLabel>
                            <Select
                                labelId="ct-select-label"
                                id="ct-select"
                                label="Certification Type"
                                name="certificationType"
                                required
                                variant="filled">
                                {certificationTypes.map((certificationType) => (
                                    <MenuItem key={certificationType.id}
                                              value={certificationType.id}>{certificationType.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <TextField fullWidth variant="filled" name="position" label="Position" required/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} name="expires" defaultValue={dayjs(new Date()).add(1, "month")}/>
                    </Grid2>
                    <Grid2 size={2}>
                        <FormSaveButton/>
                    </Grid2>
                </Grid2>
            </form>
        </LocalizationProvider>)
    );
}