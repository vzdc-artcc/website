import React from 'react';
import {Box, Card, CardContent, FormControlLabel, Switch} from "@mui/material";
import TrainingAppointmentCalendar from "@/components/TrainingAppointment/TrainingAppointmentCalendar";
import Link from "next/link";

export default async function Page({searchParams}: { searchParams: Promise<{ you: string, }>, }) {

    const filterBy = (await searchParams).you === 'true';

    return (
        <Card>
            <CardContent>
                <Box sx={{mb: 2,}}>
                    <Link href={`/training/calendar?you=${filterBy ? 'false' : 'true'}`}
                          style={{color: 'inherit', textDecoration: 'none'}}>
                        <FormControlLabel control={<Switch checked={filterBy}/>} label="Only show my appointments"/>
                    </Link>
                </Box>
                <TrainingAppointmentCalendar onlyMine={filterBy}/>
            </CardContent>
        </Card>
    );
}
