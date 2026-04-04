'use server';

import {Role, StaffPosition} from "@/generated/prisma/client";
import {z} from "zod";
import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {writeDossier} from "@/actions/dossier";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {authOptions} from "@/auth/auth";

const DEV_MODE = process.env.NODE_ENV === 'development';

export const saveStaffPositions = async (formData: FormData) => {
    const staffPositionsZ = z.object({
        userId: z.string(),
        staffPositions: z.array(z.string()),
        roles: z.array(z.string()),
        dossier: z.string().min(1, 'Dossier entry is required'),
    });

    const result = staffPositionsZ.safeParse({
        userId: formData.get('userId') as string,
        staffPositions: typeof formData.get('staffPositions') === 'string' ? (formData.get('staffPositions') as string)?.split(',') : formData.get('staffPositions'),
        roles: typeof formData.get('roles') === 'string' ? (formData.get('roles') as string)?.split(',') : formData.get('roles'),
        dossier: formData.get('dossier') as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const roles = result.data.roles;
    if (result.data.staffPositions.length > 0 && !roles.includes("STAFF")) {
        roles.push("STAFF");
    } else if (result.data.staffPositions.length === 0 && roles.includes("STAFF")) {
        roles.splice(roles.indexOf("STAFF"), 1);
    }

    const user = await prisma.user.update({
        where: {id: result.data.userId},
        data: {
            roles: {
                set: roles as Role[],
            },
            staffPositions: {
                set: (result.data.staffPositions.filter((v) => !!v)) as StaffPosition[],
            },
        },
    });

    await writeDossier(result.data.dossier, user.cid);
    await log("UPDATE", "STAFF_POSITION", `Staff positions updated for ${user.firstName} ${user.lastName} (${user.cid})`);
    revalidatePath(`/admin/staff/${user.cid}`);
    revalidatePath(`/controllers/roster`);
    return {user};
}

export const saveRoles = async (formData: FormData) => {
    const rolesZ = z.object({
        userId: z.string(),
        roles: z.array(z.string()),
        dossier: z.string().min(1, 'Dossier entry is required'),
    });

    const result = rolesZ.safeParse({
        userId: formData.get('userId') as string,
        roles: typeof formData.get('roles') === 'string' ? (formData.get('roles') as string)?.split(',') : formData.get('roles'),
        dossier: formData.get('dossier') as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const session = await getServerSession(authOptions);
    if (!DEV_MODE && session?.user?.id === result.data.userId) {
        return {errors: [{message: "You cannot change your own roles."}]};
    }

    if (result.data.roles.includes("MENTOR") && result.data.roles.includes("INSTRUCTOR")) {
        return {errors: [{message: "You must pick either MENTOR or INSTRUCTOR, not both."}]};
    }

    const user = await prisma.user.update({
        where: {id: result.data.userId},
        data: {
            roles: {
                set: result.data.roles.filter((r) => !!r) as Role[],
            },
        },
    });

    await writeDossier(result.data.dossier, user.cid);
    await log("UPDATE", "ROLE", `Roles updated for ${user.firstName} ${user.lastName} (${user.cid})`);
    revalidatePath(`/admin/staff/${user.cid}`);
    revalidatePath(`/controllers/roster`);
    return {user};
}