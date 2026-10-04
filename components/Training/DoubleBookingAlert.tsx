'use client';
import React from 'react';
import {Alert} from "@mui/material";
import {useTrainingAppointments} from "@/lib/osmium/hooks/training";

export default function DoubleBookingAlert({bufferTimeMinutes}: { bufferTimeMinutes?: string }) {
    const {data} = useTrainingAppointments({pageSize: 1, upcoming: true, doubleBooking: true});
    const numDoubleBookedAppointments = data?.total ?? 0;

    if (numDoubleBookedAppointments === 0) {
        return null;
    }

    return (
        <Alert severity="warning">There are one or more double booked training
            appointments scheduled. Check the calendar for appointments prefixed
            with &apos;(DB)&apos; and
            consider rescheduling.<br/>Appointment Buffer Time: {bufferTimeMinutes} minutes</Alert>
    );
}
