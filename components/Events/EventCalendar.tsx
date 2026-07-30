'use client';
import React from 'react';
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import {useRouter} from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

interface CalendarEvent {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    event_type?: string | null;
}

export default function EventCalendar({events, timeZone}: { events: CalendarEvent[], timeZone: string, }) {

    const router = useRouter();

    dayjs.extend(utc);
    dayjs.extend(tz);

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            timeZone="UTC"
            editable={false}
            events={events.map((event) => {

                const startOffset = dayjs.utc(event.starts_at).tz(timeZone).utcOffset();
                let newStart = dayjs.utc(event.starts_at).subtract(Math.abs(startOffset), 'minute').toDate();
                if (startOffset > 0) {
                    newStart = dayjs.utc(event.starts_at).add(Math.abs(startOffset), 'minute').toDate();
                }

                const endOffset = dayjs.utc(event.ends_at).tz(timeZone).utcOffset();
                let newEnd = dayjs.utc(event.ends_at).subtract(Math.abs(endOffset), 'minute').toDate();
                if (endOffset > 0) {
                    newEnd = dayjs.utc(event.ends_at).add(Math.abs(endOffset), 'minute').toDate();
                }

                return {
                    id: event.id,
                    title: event.title,
                    start: newStart,
                    end: newEnd,
                    color: getEventColor(event.event_type),
                };
            })}
            eventClick={(info) => {
                router.push(`/events/${info.event.id}`);
            }}
            buttonText={{
                today: "Today"
            }}
        />
    );
}

const getEventColor = (eventType?: string | null) => {
    switch (eventType) {
        case 'HOME':
            return '#f44336';
        case 'SUPPORT_REQUIRED':
            return '#834091';
        case 'SUPPORT_OPTIONAL':
            return '#cd8dd8';
        case 'FRIDAY_NIGHT_OPERATIONS':
            return '#36d1e7';
        case 'SATURDAY_NIGHT_OPERATIONS':
            return '#e6af34';
        case 'GROUP_FLIGHT':
            return '#66bb6a';
        case 'TRAINING':
            return 'darkgray';
        default:
            return 'darkgray';
    }
}
