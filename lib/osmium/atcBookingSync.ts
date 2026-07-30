'use client';
import {osmium} from "@/lib/osmium/client";

interface LiveLesson {
    duration: number;
    position: string;
}

function errorMessage(error: unknown): string {
    const e = error as { message?: string; error?: string } | undefined;
    return e?.message ?? e?.error ?? "ATC booking service error";
}

async function fetchBooking(id: number) {
    const {data} = await osmium.GET("/api/v1/bookings/{id}", {params: {path: {id}}});
    return data ?? null;
}

async function deleteBooking(id: number) {
    await osmium.DELETE("/api/v1/bookings/{id}", {params: {path: {id}}});
}

/**
 * Client-side ATC-booking sync for a training appointment (osmium proxy).
 * Replaces the former `actions/trainingAppointment.ts` server action now that
 * the token lives in osmium. Creates a `training`-type booking on the trainer's
 * cid for the live-controlling lesson, replacing any existing one.
 */
export async function syncAppointmentAtcBooking(params: {
    trainerCid: number,
    start: string,
    existingAtcBookingId?: string | null,
    liveLesson?: LiveLesson | null,
}): Promise<{ atcBookingId: string | null, error?: string }> {
    const {trainerCid, start, existingAtcBookingId, liveLesson} = params;

    const existing = existingAtcBookingId ? await fetchBooking(Number(existingAtcBookingId)) : null;

    if (liveLesson) {
        const bookingEnd = new Date(new Date(start).getTime() + liveLesson.duration * 60000);

        if (existing) {
            await deleteBooking(existing.id);
        }

        const {data, error} = await osmium.POST("/api/v1/bookings", {
            body: {
                cid: trainerCid,
                start: start.replace(/\.\d{3}Z$/, '').replace('T', ' '),
                end: bookingEnd.toISOString().replace(/\.\d{3}Z$/, '').replace('T', ' '),
                callsign: liveLesson.position,
                type: 'training',
            },
        });

        if (error || !data) {
            return {atcBookingId: existingAtcBookingId || null, error: errorMessage(error)};
        }

        return {atcBookingId: String(data.id)};
    } else if (existing) {
        await deleteBooking(existing.id);
        return {atcBookingId: null};
    }

    return {atcBookingId: existingAtcBookingId || null};
}

export async function deleteAppointmentAtcBooking(atcBookingId?: string | null) {
    if (atcBookingId) {
        await deleteBooking(Number(atcBookingId));
    }
}
