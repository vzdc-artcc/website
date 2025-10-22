'use server';

import {AtcBooking} from "@/lib/atcBooking";
import {revalidatePath} from "next/cache";
import prisma from "@/lib/db";

const {ATC_BOOKING_TOKEN: token} = process.env;

export const fetchTrainingBooking = async (cid: string): Promise<AtcBooking | null> => {
    const queryParams = new URLSearchParams();
    queryParams.append('key_only', '1');
    queryParams.append('sort', 'start');
    queryParams.append('cid', cid);
    queryParams.append('type', 'mentoring');

    const res = await fetch(`https://atc-bookings.vatsim.net/api/booking?${queryParams.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: {
            revalidate: 0,
        },
    });

    const json = await res.json();

    if (!res.ok) {
        return null;
    }

    if (Array.isArray(json) && json.length > 0) {
        return json[0] || null;
    }

    return undefined;
}

export const fetchAtcBookings = async (onlyCid?: string): Promise<AtcBooking[] | string> => {
    const queryParams = new URLSearchParams();
    queryParams.append('key_only', '1');
    queryParams.append('sort', 'start');

    if (onlyCid) {
        queryParams.append('cid', onlyCid);
    }

    const res = await fetch(`https://atc-bookings.vatsim.net/api/booking?${queryParams.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: {
            revalidate: 0,
        },
    });

    const json = await res.json();

    if (!res.ok) {
        return `Error fetching ATC bookings: ${json.message || res.statusText}`;
    }


    return json;
}

export const fetchAtcBooking = async (id: number): Promise<AtcBooking | string> => {
    const res = await fetch(`https://atc-bookings.vatsim.net/api/booking/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: {
            revalidate: 0,
        },
    });

    const json = await res.json();

    if (!res.ok) {
        return `Error fetching ATC booking: ${json.message || res.statusText}`;
    }

    return json;
}

export const createOrUpdateAtcBooking = async (
    booking: Omit<AtcBooking, 'id'> & { id?: number },
): Promise<AtcBooking | string> => {
    const isUpdate = typeof booking.id === 'number';
    const url = isUpdate
        ? `https://atc-bookings.vatsim.net/api/booking/${booking.id}`
        : `https://atc-bookings.vatsim.net/api/booking`;

    if (!isUpdate) {
        const bookings = await fetchAtcBookings(String(booking.cid));
        if (Array.isArray(bookings) && bookings.length >= 3) {
            return 'You have reached the maximum number of active bookings (2). Please delete an existing booking before creating a new one.';
        }
    }

    // validate to make sure that the start of the booking is made at most 72 hours in advance and the booking can be at most 2 hours long
    const start = new Date(booking.start);
    const end = new Date(booking.end);
    const now = new Date();

    if (start.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
        return 'Bookings must be made at least 2 hours in advance.';
    }

    if (start.getTime() - now.getTime() > 72 * 60 * 60 * 1000) {
        return 'Bookings can only be made up to 72 hours in advance.';
    }

    if (end.getTime() - start.getTime() > 2 * 60 * 60 * 1000) {
        return 'Bookings can only be made for a maximum duration of 2 hours.';
    }


    const prefixes = await prisma.statisticsPrefixes.findFirst();
    if (prefixes && !prefixes.prefixes.some(prefix => booking.callsign.startsWith(prefix))) {
        return `Error: Callsign is not valid for this ARTCC.`;
    }

    const method = isUpdate ? 'PUT' : 'POST';
    const {id, ...body} = booking;

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
        console.log(json);
        return `Error ${isUpdate ? 'updating' : 'creating'} ATC booking: ${json.message || res.statusText}`;
    }

    revalidatePath('/profile/bookings');
    return json;
}

export const deleteAtcBooking = async (id: number): Promise<boolean> => {
    const res = await fetch(`https://atc-bookings.vatsim.net/api/booking/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    revalidatePath('/profile/bookings');
    return res.ok;
}