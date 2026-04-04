'use client';
import React from 'react';
import {Airport} from "@prisma/client";
import {Grid, TextField,} from "@mui/material";
import {toast} from "react-toastify";
import {upsertAirport} from "@/actions/airports";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function AirportForm({airport, traconGroupId}: { airport?: Airport, traconGroupId: string, }) {

    const router = useRouter();
    const handleSubmit = async (formData: FormData) => {

        const {airport: savedAirport, errors} = await upsertAirport(formData);
        if (errors) {
            toast(errors.map(e => e.message).join(".  "), {type: 'error'});
            return;
        }

        toast(`Airport '${savedAirport.icao}' saved successfully!`, {type: 'success'});

        if (!airport) {
            router.push(`/admin/airports/airport/${savedAirport.id}`);
        }
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="traconGroupId" value={traconGroupId}/>
            <input type="hidden" name="id" value={airport?.id}/>
            <Grid container columns={2} spacing={2}>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="ICAO" name="icao" defaultValue={airport?.icao || ''}/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="IATA" name="iata" defaultValue={airport?.iata || ''}/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="Name" name="name" defaultValue={airport?.name || ''}/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="City" name="city" defaultValue={airport?.city || ''}/>
                </Grid>
                <Grid size={2}>
                    <FormSaveButton />
                </Grid>
            </Grid>
        </form>)
    );

}