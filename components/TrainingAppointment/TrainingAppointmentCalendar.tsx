'use client';
import React from 'react';
import {Lesson, TrainingAppointment} from "@prisma/client";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import {User} from "next-auth";
import TrainingAppointmentInformationDialog
    from "@/components/TrainingAppointment/TrainingAppointmentInformationDialog";

export type TrainingAppointmentWithAll = TrainingAppointment & {
    student: User,
    trainer: User,
    lessons: Lesson[],
}

export default function TrainingAppointmentCalendar({appointments, isTrainingStaff}: {
    appointments: TrainingAppointmentWithAll[],
    isTrainingStaff: boolean
}) {

    const [openId, setOpenId] = React.useState<string | null>(null);

    return (
        <>
            {openId && <TrainingAppointmentInformationDialog
                isTrainingStaff={isTrainingStaff}
                trainingAppointment={appointments.find(a => a.id === openId) as TrainingAppointmentWithAll} manualOpen
                onClose={() => setOpenId(null)}/>}
            <FullCalendar
                plugins={[dayGridPlugin]}
                timeZone="local"
                editable={false}
                events={appointments.map((a) => ({
                    id: a.id,
                    title: `${a.doubleBooking ? '(DB)' : ''} ${a.student.fullName}`,
                    start: a.start,
                    end: getEndTime(a.start, a.lessons.map(l => l.duration).reduce((a, b) => a + b, 0)),
                    color: getRatingColor(a.student.rating),
                }))}
                eventClick={(info) => {
                    if (openId === info.event.id) {
                        setOpenId(null);
                    } else {
                        setOpenId(info.event.id);
                    }
                }}
                buttonText={{
                    today: "Today"
                }}
            />
        </>

    );

}

const getEndTime = (start: Date, duration: number) => {
    return new Date(start.getTime() + duration * 60000);
}

const getRatingColor = (rating: number) => {
    switch (rating) {
        case 1:
            return '#66bb6a';
        case 2:
            return '#f44336';
        case 3:
            return '#36d1e7';
        case 4:
            return '#cd8dd8';
        case 5:
            return '#e6af34';
        default:
            return 'darkgray';
    }
}