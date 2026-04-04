'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import { after } from 'next/server';
import { log } from './log';
import {TmiCategory, EventTmi} from '@/generated/prisma/client';

export const fetchTmis = async (eventId: string): Promise<EventTmi[]> => {
    const tmis = await prisma.eventTmi.findMany({
        where: { eventId },
        orderBy: { createdAt: 'asc' },
    });

    return tmis;
};


export const addTmi = async (eventId: string, formData: FormData, admin?: boolean) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { errors: [{ message: 'You must be logged in to perform this action' }] };
    }
    const allowed = session.user.roles.includes('STAFF') || session.user.roles.includes('EVENT_STAFF') || admin;
    if (!allowed) return { errors: [{ message: 'You do not have permission to perform this action' }] };

    const text = (formData.get('text') as string) || '';
    const categoryRaw = (formData.get('category') as string) || '';
    if (!text.trim()) return { errors: [{ message: 'TMI cannot be empty' }] };

    const category = (categoryRaw as keyof typeof TmiCategory) || 'LOCAL';

    try {
        const created = await prisma.eventTmi.create({
            data: {
                eventId,
                text: text.trim(),
                category: category as TmiCategory,
                createdBy: session.user.id,
            },
        });

        after(async () => await log('CREATE', 'EVENT', `Added TMI to event ${eventId}`));
        try { const { revalidatePath } = await import('next/cache'); revalidatePath(`/events/admin/events/${eventId}/manager`); } catch {}

        return { tmi: created };
    } catch (err) {
        console.error('addTmi error', err);
        return { errors: [{ message: 'Failed to add TMI' }] };
    }
};

export const updateTmi = async (tmiId: string, formData: FormData, admin?: boolean) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { errors: [{ message: 'You must be logged in to perform this action' }] };
    const allowed = session.user.roles.includes('STAFF') || session.user.roles.includes('EVENT_STAFF') || admin;
    if (!allowed) return { errors: [{ message: 'You do not have permission to perform this action' }] };

    const text = (formData.get('text') as string) || '';
    const categoryRaw = (formData.get('category') as string) || '';
    if (!text.trim()) return { errors: [{ message: 'TMI cannot be empty' }] };

    try {
        const updated = await prisma.eventTmi.update({
            where: { id: tmiId },
            data: {
                text: text.trim(),
                category: categoryRaw as TmiCategory,
            },
        });

        after(async () => await log('UPDATE', 'EVENT', `Updated TMI ${tmiId}`));
        try { const { revalidatePath } = await import('next/cache'); revalidatePath(`/events/admin/events/${updated.eventId}/manager`); } catch {}

        return { tmi: updated };
    } catch (err) {
        console.error('updateTmi error', err);
        return { errors: [{ message: 'Failed to update TMI' }] };
    }
};

export const deleteTmi = async (tmiId: string, admin?: boolean) => {
    
    const session = await getServerSession(authOptions);
    if (!session?.user) return { errors: [{ message: 'You must be logged in to perform this action' }] };
    const allowed = session.user.roles.includes('STAFF') || session.user.roles.includes('EVENT_STAFF') || admin;
    if (!allowed) return { errors: [{ message: 'You do not have permission to perform this action' }] };

    try {
        const deleted = await prisma.eventTmi.delete({
            where: { id: tmiId },
        });

        after(async () => await log('DELETE', 'EVENT', `Deleted TMI ${tmiId}`));
        try { const { revalidatePath } = await import('next/cache'); revalidatePath(`/events/admin/events/${deleted.eventId}/manager`); } catch {}

        return { tmi: deleted };
    } catch (err) {
        console.error('deleteTmi error', err);
        return { errors: [{ message: 'Failed to delete TMI' }] };
    }
};
