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
        guildId: formData.get("guildId") as string | null,
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
    await log(result.data.id ? "UPDATE" : "CREATE", "DISCORD_CONFIG", `Saved channel ${channel.name} (${channel.name})`);
    revalidatePath("/web-system/discord-configs");
    revalidatePath(`web-system/discord-configs/channel/${channel.id}`);
    return {channel};
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
