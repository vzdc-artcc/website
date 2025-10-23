'use client';

export type AtcBooking = {
    id: number;
    callsign: string;
    cid: number;
    type?: 'booking' | 'event' | 'exam' | 'training';
    division?: string;
    subdivision?: string;
    start: string; // ISO 8601 date string
    end: string;   // ISO 8601 date string
};