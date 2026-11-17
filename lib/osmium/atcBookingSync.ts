'use client';
import {osmium} from "@/lib/osmium/client";
import {bookingErrorMessage} from "@/lib/osmium/hooks/bookings";

interface LiveLesson {
    duration: number;
    position: string;
}

// osmium answers 404 when VATSIM has no booking with this id: nothing exists to replace or remove.
async function fetchBooking(id: number) {
    const {data, error, response} = await osmium.GET("/api/v1/bookings/{id}", {params: {path: {id}}});
    if (response.status === 404) return null;
    if (error) throw new Error(bookingErrorMessage(error));
    return data;
}

async function deleteBooking(id: number) {
    const {error, response} = await osmium.DELETE("/api/v1/bookings/{id}", {params: {path: {id}}});
    // 404 means the booking is already gone, which is the outcome the delete wanted.
    if (error && response.status !== 404) throw new Error(bookingErrorMessage(error));
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

    // A booking that could not be read or removed may still exist, so the appointment keeps
    // pointing at it and no replacement is created beside it.
    let existing: Awaited<ReturnType<typeof fetchBooking>>;
    try {
        existing = existingAtcBookingId ? await fetchBooking(Number(existingAtcBookingId)) : null;
        if (existing) {
            await deleteBooking(existing.id);
        }
    } catch (e) {
        return {atcBookingId: existingAtcBookingId || null, error: (e as Error).message};
    }

    if (liveLesson) {
        const bookingEnd = new Date(new Date(start).getTime() + liveLesson.duration * 60000);

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
            return {atcBookingId: existingAtcBookingId || null, error: bookingErrorMessage(error)};
        }

        return {atcBookingId: String(data.id)};
    }

    if (existing) {
        return {atcBookingId: null};
    }

    return {atcBookingId: existingAtcBookingId || null};
}

export async function deleteAppointmentAtcBooking(atcBookingId?: string | null) {
    if (atcBookingId) {
        await deleteBooking(Number(atcBookingId));
    }
}
