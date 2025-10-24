'use client';
import React from 'react';
import {AtcBooking} from "@/lib/atcBooking";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export default function AtcBookingsCalendar({bookings, timeZone}: { bookings: AtcBooking[], timeZone: string }) {

    dayjs.extend(utc)
    dayjs.extend(timezone)

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            timeZone="UTC"
            editable={false}
            events={bookings.map((booking) => {

                const startOffset = dayjs.utc(booking.start).tz(timeZone).utcOffset();
                let newStart = dayjs.utc(booking.start).subtract(Math.abs(startOffset), 'minute').toDate();
                if (startOffset > 0) {
                    newStart = dayjs.utc(booking.start).add(Math.abs(startOffset), 'minute').toDate();
                }

                const endOffset = dayjs.utc(booking.end).tz(timeZone).utcOffset();
                let newEnd = dayjs.utc(booking.end).subtract(Math.abs(endOffset), 'minute').toDate();
                if (endOffset > 0) {
                    newEnd = dayjs.utc(booking.end).add(Math.abs(endOffset), 'minute').toDate();
                }

                return {
                    id: booking.id + "",
                    title: booking.callsign,
                    start: newStart,
                    end: newEnd,
                    color: booking.type === 'booking' ? 'cyan' : 'red',
                };
            })}
            buttonText={{
                today: "Today"
            }}
        />
    );
}