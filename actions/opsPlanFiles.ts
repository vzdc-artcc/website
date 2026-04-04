'use server';

import {UTApi} from 'uploadthing/server';
import {z} from 'zod';
import prisma from '@/lib/db';
import {log} from '@/actions/log';
import {revalidatePath} from 'next/cache';
import {LogModel} from '@/generated/prisma/client';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/auth/auth';

const ut = new UTApi();

export const createOrUpdateOpsPlanFile = async (formData: FormData) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return { errors: [{ message: 'You must be logged in to perform this action' }] };
    }

    if (!session.user.roles.includes('STAFF') && !session.user.roles.includes('EVENT_STAFF')) {
        return { errors: [{ message: 'You do not have permission to perform this action' }] };
    }

    const schema = z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Name is required').max(250),
        description: z.string().optional(),
        eventId: z.string().optional(),
    });

    const parsed = schema.safeParse({
        id: formData.get('id') ? String(formData.get('id')) : undefined,
        name: formData.get('name') ? String(formData.get('name')) : '',
        description: formData.get('description') ? String(formData.get('description')) : undefined,
        eventId: formData.get('eventId') ? String(formData.get('eventId')) : undefined,
    });

    if (!parsed.success) {
        return { errors: parsed.error.errors };
    }

    const inputFile = formData.get('file') as File | null;
    const existing = parsed.data.id ? await prisma.opsPlanFile.findUnique({ where: { id: parsed.data.id } }) : null;

    let fileKey = existing?.key || '';

    if (inputFile && inputFile.size > 0) {
        const res = await ut.uploadFiles(inputFile);
        if (res.error) {
            console.error('UploadThing error', res.error);
            throw new Error('Failed to upload file');
        }
        fileKey = res.data.key;

        if (existing && existing.key) {
            try {
                await ut.deleteFiles(existing.key);
            } catch (e) {
                console.warn('Failed to delete previous remote file', e);
            }
        }
    } else if (!existing) {
        return { errors: [{ message: 'File is required for new entries' }] };
    }

    // upsert into DB
    const opsFile = await prisma.opsPlanFile.upsert({
        where: { id: parsed.data.id || '' },
        create: {
            name: parsed.data.name,
            description: parsed.data.description || null,
            key: fileKey,
            eventId: parsed.data.eventId || null,
            createdBy: session.user.id,
        },
        update: {
            name: parsed.data.name,
            description: parsed.data.description || null,
            key: fileKey,
            eventId: parsed.data.eventId || null,
            updatedAt: new Date(),
        },
    });

    // Logging & revalidation
    await log('CREATE', LogModel.OPS_PLAN_FILE, `Uploaded ops plan file ${opsFile.name}`);
    if (opsFile.eventId) {
        revalidatePath(`/events/${opsFile.eventId}/ops`);
    }
    revalidatePath('/events/ops');

    return { opsFile };
};

export const deleteOpsPlanFile = async (id: string) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return { error: 'You must be logged in to perform this action' };
    }

    if (!session.user.roles.includes('STAFF') && !session.user.roles.includes('EVENT_STAFF')) {
        return { error: 'You do not have permission to perform this action' };
    }

    const file = await prisma.opsPlanFile.findUnique({ where: { id } });
    if (!file) return { error: 'Not found' };

    try {
        await ut.deleteFiles(file.key);
    } catch (e) {
        console.warn('Failed to delete remote file', e);
    }

    await prisma.opsPlanFile.delete({ where: { id } });
    await log('DELETE', LogModel.OPS_PLAN_FILE, `Deleted ops plan file ${file.name}`);

    if (file.eventId) revalidatePath(`/events/${file.eventId}/ops`);
    revalidatePath('/events/ops');

    return { ok: true };
};

export const fetchOpsPlanFiles = async (eventId?: string) => {
    if (!eventId) {
        return prisma.opsPlanFile.findMany({ orderBy: { updatedAt: 'desc' } });
    }
    return prisma.opsPlanFile.findMany({
        where: {
            OR: [{ eventId }, { eventId: null }],
        },
        orderBy: { updatedAt: 'desc' },
    });
};
