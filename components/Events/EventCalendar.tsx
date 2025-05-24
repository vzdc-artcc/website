'use client';
import React from 'react';
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import {useRouter} from "next/navigation";
import {EventType} from '@prisma/client';

export default function EventCalendar({events, timeZone}: { events: any[], timeZone: string, }) {

    const router = useRouter();

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            timeZone={timeZone}
            editable={false}
            events={events.map((event) => ({
                id: event.id,
                title: event.name,
                start: event.start,
                end: event.end,
                color: getEventColor(event.type),
            }))}
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