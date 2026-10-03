'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {log} from "@/actions/log";

export const updatePrefixes = async (formData: FormData) => {
    const prefixesZ = z.object({
        id: z.string().optional(),
        prefixes: z.array(z.string().toUpperCase()),
    });

    const result = prefixesZ.safeParse({
        id: formData.get('id') as string,
        prefixes: (formData.get('prefixes') + '').split(','),
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    await prisma.statisticsPrefixes.deleteMany();

    const prefixes = await prisma.statisticsPrefixes.upsert({
        where: {
            id: result.data.id,
        },
        update: {
            prefixes: {
                set: result.data.prefixes,
            },
        },
        create: {
            prefixes: {
                set: result.data.prefixes,
            },
        },
    });

    await log(result.data.id ? 'UPDATE' : 'CREATE', "STATISTICS_PREFIXES", `Updated statistics prefixes to ${prefixes.prefixes.join(',')}`)

    return {prefixes};
}