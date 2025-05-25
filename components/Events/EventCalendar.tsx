'use client';
import React from 'react';
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import {useRouter} from "next/navigation";
import {EventType} from '@prisma/client';
import dayjs from "dayjs";

export default function EventCalendar({events, timeZone}: { events: any[], timeZone: string, }) {

    const router = useRouter();

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            timeZone="UTC"
            editable={false}
            events={events.map((event) => {

                const startOffset = dayjs.utc(event.start).tz(timeZone).utcOffset();
                let newStart = dayjs.utc(event.start).subtract(Math.abs(startOffset), 'minute').toDate();
                if (startOffset > 0) {
                    newStart = dayjs.utc(event.start).add(Math.abs(startOffset), 'minute').toDate();
                }

                const endOffset = dayjs.utc(event.end).tz(timeZone).utcOffset();
                let newEnd = dayjs.utc(event.end).subtract(Math.abs(endOffset), 'minute').toDate();
                if (endOffset > 0) {
                    newEnd = dayjs.utc(event.end).add(Math.abs(endOffset), 'minute').toDate();
                }

                return {
                    id: event.id,
                    title: event.name,
                    start: newStart,
                    end: newEnd,
                    color: getEventColor(event.type),
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

const getEventColor = (eventType: EventType) => {
    switch (eventType) {
        case EventType.HOME:
            return '#f44336';
        case EventType.SUPPORT_REQUIRED:
            return '#834091';
        case EventType.SUPPORT_OPTIONAL:
            return '#cd8dd8';
        case EventType.FRIDAY_NIGHT_OPERATIONS:
            return '#36d1e7';
        case EventType.SATURDAY_NIGHT_OPERATIONS:
            return '#e6af34';
        case EventType.GROUP_FLIGHT:
            return '#66bb6a';
        case EventType.TRAINING:
            return 'darkgray';
        default:
            return 'darkgray';
    }
}