'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";

export const upsertDiscordConfig = async (formData: FormData) => {
    const discordConfigZ = z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Name must not be empty"),
        guildId: z.string().optional().nullable(),
    });

    const result = discordConfigZ.safeParse({
        id: formData.get("id") as string,
        name: formData.get("name") as string,
        guildId: formData.get("guildId") as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    let discordConfig;
    if (result.data.id) {
        discordConfig = await prisma.discordConfig.update({
            where: { id: result.data.id },
            data: {
                name: result.data.name,
                guildId: result.data.guildId,
            },
        });
        await log("UPDATE", "DISCORD_CONFIG", `Saved Discord Config ${discordConfig.name}`);
    } else {
        discordConfig = await prisma.discordConfig.create({
            data: {
                name: result.data.name,
                guildId: result.data.guildId,
            },
        });
        await log("CREATE", "DISCORD_CONFIG", `Saved Discord Config ${discordConfig.name}`);
    }

    revalidatePath("/web-system/discord-configs");
    return {discordConfig: discordConfig};
}

export const upsertChannel = async (formData: FormData) => {

    const channelZ = z.object({
        id: z.string().optional(),
        discordConfigId: z.string(),
        channelId: z.string().min(1, "Channel ID must not be empty"),
        name: z.string().min(1, "Name must not be empty"),
    });

    const result = channelZ.safeParse({
        id: formData.get("id") as string,
        discordConfigId: formData.get("discordConfigId") as string,
        channelId: formData.get("channelId") as string,
        name: formData.get("name") as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const channel = await prisma.discordChannel.upsert({
        create: {
            name: result.data.name,
            discordConfigId: result.data.discordConfigId,
            channelId: result.data.channelId,
        },
        update: {
            name: result.data.name,
            discordConfigId: result.data.discordConfigId,
            channelId: result.data.channelId,
        },
        where: {
            id: result.data.id || '',
        },
    });
    await log(result.data.id ? "UPDATE" : "CREATE", "DISCORD_CONFIG", `Saved channel ${channel.name}`);
    revalidatePath("/web-system/discord-configs");
    revalidatePath(`/web-system/discord-configs/channel/${channel.id}`);
    return {channel};
}

export const upsertRole = async (formData: FormData) => {

    const roleZ = z.object({
        id: z.string().optional(),
        discordConfigId: z.string(),
        roleId: z.string().min(1, "Role ID must not be empty"),
        name: z.string().min(1, "Name must not be empty"),
    });

    const result = roleZ.safeParse({
        id: formData.get("id") as string,
        discordConfigId: formData.get("discordConfigId") as string,
        roleId: formData.get("roleId") as string,
        name: formData.get("name") as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const role = await prisma.discordRole.upsert({
        create: {
            name: result.data.name,
            discordConfigId: result.data.discordConfigId,
            roleId: result.data.roleId,
        },
        update: {
            name: result.data.name,
            discordConfigId: result.data.discordConfigId,
            roleId: result.data.roleId,
        },
        where: {
            id: result.data.id || '',
        },
    });
    await log(result.data.id ? "UPDATE" : "CREATE", "DISCORD_CONFIG", `Saved role ${role.name}`);
    revalidatePath("/web-system/discord-configs");
    revalidatePath(`/web-system/discord-configs/role/${role.id}`);
    return {role};
}

export const upsertCategory = async (formData: FormData) => {

    const categoryZ = z.object({
        id: z.string().optional(),
        discordConfigId: z.string(),
        categoryId: z.string().min(1, "Category ID must not be empty"),
        name: z.string().min(1, "Name must not be empty"),
    });

    const result = categoryZ.safeParse({
        id: formData.get("id") as string,
        discordConfigId: formData.get("discordConfigId") as string,
        categoryId: formData.get("categoryId") as string,
        name: formData.get("name") as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const category = await prisma.discordCategory.upsert({
        create: {
            name: result.data.name,
            discordConfigId: result.data.discordConfigId,
            categoryId: result.data.categoryId,
        },
        update: {
            name: result.data.name,
            discordConfigId: result.data.discordConfigId,
            categoryId: result.data.categoryId,
        },
        where: {
            id: result.data.id || '',
        },
    });
    await log(result.data.id ? "UPDATE" : "CREATE", "DISCORD_CONFIG", `Saved category ${category.name}`);
    revalidatePath("/web-system/discord-configs");
    revalidatePath(`/web-system/discord-configs/category/${category.id}`);
    return {category};
}

export const deleteDiscordConfig = async (discordConfigId: string) => {
    const discordConfig = await prisma.discordConfig.delete({
        where: {
            id: discordConfigId,
        },
    });
    await log("DELETE", "DISCORD_CONFIG", `Deleted Discord Config ${discordConfig.name}`);
    revalidatePath("/web-system/discord-configs");
    return discordConfig;
}
export const deleteChannel = async (id: string) => {
    const channel = await prisma.discordChannel.delete({
        where: {
            id,
        }
    });
    await log("DELETE", "DISCORD_CONFIG", `Deleted channel: ${channel.name}`);
    revalidatePath("/web-system/discord-configs");
    return channel;
}
export const deleteCategory = async (id: string) => {
    const category = await prisma.discordCategory.delete({
        where: {
            id,
        }
    });
    await log("DELETE", "DISCORD_CONFIG", `Deleted category: ${category.name}`);
    revalidatePath("/web-system/discord-configs");
    return category;
}

export const deleteRole = async (id: string) => {
    const role = await prisma.discordRole.delete({
        where: {
            id,
        }
    });
    await log("DELETE", "DISCORD_CONFIG", `Deleted role: ${role.name}`);
    revalidatePath("/web-system/discord-configs");
    return role;
}