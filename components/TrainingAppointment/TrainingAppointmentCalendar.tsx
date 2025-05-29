'use client';
import React from 'react';
import {Lesson, TrainingAppointment} from "@prisma/client";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import {User} from "next-auth";
import TrainingAppointmentInformationDialog
    from "@/components/TrainingAppointment/TrainingAppointmentInformationDialog";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export type TrainingAppointmentWithAll = TrainingAppointment & {
    student: User,
    trainer: User,
    lessons: Lesson[],
}

export default function TrainingAppointmentCalendar({appointments, isTrainingStaff, timeZone}: {
    appointments: TrainingAppointmentWithAll[],
    isTrainingStaff: boolean,
    timeZone: string,
}) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [openId, setOpenId] = React.useState<string | null>(null);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            {openId && <TrainingAppointmentInformationDialog
                timeZone={timeZone}
                isTrainingStaff={isTrainingStaff}
                trainingAppointment={appointments.find(a => a.id === openId) as TrainingAppointmentWithAll} manualOpen
                onClose={() => setOpenId(null)}/>}
            <FullCalendar
                plugins={[dayGridPlugin]}
                timeZone="UTC"
                editable={false}
                events={appointments.map((a) => {

                    // convert start time to utc, but offset it to the user's timezone in UTC timezone, so just subtract the offset
                    const startOffset = dayjs.utc(a.start).tz(timeZone).utcOffset();
                    let newStart = dayjs.utc(a.start).subtract(Math.abs(startOffset), 'minute').toDate();
                    if (startOffset > 0) {
                        newStart = dayjs.utc(a.start).add(Math.abs(startOffset), 'minute').toDate();
                    }

                    return {
                        id: a.id,
                        title: `${a.doubleBooking ? '(DB)' : ''} ${a.student.fullName}`,
                        start: newStart,
                        end: getEndTime(newStart, a.lessons.map(l => l.duration).reduce((a, b) => a + b, 0)),
                        color: getRatingColor(a.student.rating),
                    };
                })}
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
        </LocalizationProvider>

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