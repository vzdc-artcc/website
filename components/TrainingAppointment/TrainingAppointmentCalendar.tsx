'use client';
import React from 'react';
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import TrainingAppointmentInformationDialog
    from "@/components/TrainingAppointment/TrainingAppointmentInformationDialog";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {useTrainingAppointments} from "@/lib/osmium/hooks/training";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useMe} from "@/lib/osmium/hooks/me";
import {useHasStaffPosition} from "@/lib/osmium/hooks/staff-positions";
import {CircularProgress} from "@mui/material";

export default function TrainingAppointmentCalendar({onlyMine}: {
    onlyMine?: boolean,
}) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const {data: me} = useMe();
    const timeZone = me?.profile.timezone ?? 'America/New_York';
    const {has: isTrainingStaff} = useHasStaffPosition(['TA', 'ATA']);
    const onlyForCid = onlyMine && me ? String(me.cid) : undefined;

    const [openId, setOpenId] = React.useState<string | null>(null);
    const {data, isLoading} = useTrainingAppointments();
    const {data: rosterData} = useRosterControllers();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const ratingByCid = new Map((rosterData?.items ?? []).map((u) => [u.basic.cid, u.basic.rating]));

    const appointments = (data?.items ?? []).filter((a) => !onlyForCid || String(a.trainer_cid) === onlyForCid);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            {openId && <TrainingAppointmentInformationDialog
                timeZone={timeZone}
                isTrainingStaff={isTrainingStaff}
                trainingAppointment={appointments.find(a => a.id === openId)!} manualOpen
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
                        title: `${a.double_booking ? '(DB)' : ''} ${a.student_name}`,
                        start: newStart,
                        end: getEndTime(newStart, a.estimated_duration_minutes ?? 0),
                        color: getRatingColor(ratingByCid.get(a.student_cid)),
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

const getRatingColor = (rating?: string | null) => {
    switch (rating) {
        case 'OBS':
            return '#66bb6a';
        case 'S1':
            return '#f44336';
        case 'S2':
            return '#36d1e7';
        case 'S3':
            return '#cd8dd8';
        case 'C1':
            return '#e6af34';
        default:
            return 'darkgray';
    }
}
