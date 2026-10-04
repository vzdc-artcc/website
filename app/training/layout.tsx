import React from 'react';
import {Alert, Stack} from "@mui/material";
import TrainingMenu from "@/components/Admin/TrainingMenu";
import {Metadata} from "next";
import prisma from "@/lib/db";
import AdminLayout from "@/components/Admin/AdminLayout";

export const metadata: Metadata = {
    title: 'Training | vZDC',
    description: 'vZDC training admin page',
};

const {BUFFER_TIME} = process.env;

export default async function Layout({children}: { children: React.ReactNode }) {
    const numDoubleBookedAppointments = await prisma.trainingAppointment.count({
        where: {
            start: {
                gte: new Date(),
            },
            doubleBooking: true,
        },
    });

    return (
        <AdminLayout name="Training Administration" sidebar={<TrainingMenu/>}
                     allowed={(user) => user.roles.some(r => ["MENTOR", "INSTRUCTOR", "STAFF"].includes(r))}>
            <Stack direction="column" spacing={2}>
                {numDoubleBookedAppointments > 0 &&
                    <Alert severity="warning">There are one or more double booked training
                        appointments scheduled. Check the calendar for appointments prefixed
                        with &apos;(DB)&apos; and
                        consider rescheduling.<br/>Appointment Buffer Time: {BUFFER_TIME} minutes</Alert>}
                {children}
            </Stack>
        </AdminLayout>
    );
}