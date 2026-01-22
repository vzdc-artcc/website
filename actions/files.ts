'use server';

import {UTApi} from "uploadthing/server";
import {z} from "zod";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {OrderItem} from "@/components/Order/OrderList";
import {FileCategory, HighlightColorType} from "@prisma/client";

const ut = new UTApi();

export const createOrUpdateFileCategory = async (formData: FormData) => {
    const fileCategoryZ = z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    });

    const result = fileCategoryZ.safeParse({
        id: formData.get('id') as string,
        name: formData.get('name') as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const fileCategory = await prisma.fileCategory.upsert({
        where: {id: result.data.id || ''},
        update: {
            name: result.data.name,
        },
        create: {
            name: result.data.name,
        },
    });

    if (result.data.id) {
        await log("UPDATE", "FILE_CATEGORY", `Updated file category ${fileCategory.name}`);
    } else {
        await log("CREATE", "FILE_CATEGORY", `Created file category ${fileCategory.name}`);
    }

    revalidatePath('/admin/files');
    return {fileCategory}
}

export const updateFileCategoryOrder = async (order: OrderItem[]) => {
    for (const item of order) {
        await prisma.fileCategory.update({
            where: {id: item.id},
            data: {
                order: item.order,
            },
        });
    }

    await log("UPDATE", "FILE_CATEGORY", `Updated file category order`);

    revalidatePath('/admin/files', 'layout');
    revalidatePath('/publications/downloads');
}

export const deleteFileCategory = async (id: string) => {
    const fileCategory = await prisma.fileCategory.findUnique({
        where: {id},
        include: {
            files: true,
        },
    });

    if (!fileCategory) {
        return;
    }

    for (const file of fileCategory.files) {
        await ut.deleteFiles(file.key);
        await prisma.file.delete({
            where: {id: file.id},
        });
    }

    await prisma.fileCategory.delete({
        where: {id},
    });

    await log("DELETE", "FILE_CATEGORY", `Deleted file category ${fileCategory.name}`);
    revalidatePath('/admin/files');
}

export const createOrUpdateFile = async (formData: FormData) => {
    console.log('upserting file');
const fileZ = z.object({
        categoryId: z.string(),
        id: z.string().optional(),
        name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
        alias: z.string().optional(),
        description: z.string().max(255, 'Description is too long'),
        highlightColor: z.string().min(1, "Highlight color is required"),
    });

    const result = fileZ.safeParse({
        categoryId: formData.get('categoryId') as string,
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        alias: formData.get('alias') as string,
        description: formData.get('description') as string,
        highlightColor: formData.get('highlightColor') as string
    });

console.log('validating data');
    if (!result.success) {
        return {errors: result.error.errors};
    }

    const fileExists = await prisma.file.findUnique({
        where: {
            id: result.data.id || '',
        },
    });

    const aliasExists = await prisma.file.findUnique({
        where: {
            alias: result.data.alias || '',
        },
    });

    if (aliasExists && aliasExists.id !== result.data.id) {
        return {errors: [{message: "Alias must be unique"}]};
    }

    console.log('Uploading file from input...');
    const inputFile = formData.get('file') as File | null;
    let fileKey = fileExists?.key || '';

    if (inputFile && inputFile.size > 0) {
        console.log('uploading to uploadthing');
        const res = await ut.uploadFiles(inputFile);
        if (res.error) {
            console.log(res.error);
            throw new Error("Error saving file");
        }
        fileKey = res.data.key;
        if (fileExists) {
            console.log('deleting old file from uploadthing');
            await ut.deleteFiles(fileExists.key);
        }
    } else if (!fileExists) {
        return {errors: [{message: "File is required for new entries"}]};
    }

    const file = await prisma.file.upsert({
        where: {id: result.data.id || ''},
        update: {
            name: result.data.name,
            alias: result.data.alias || null,
            description: result.data.description,
            key: fileKey,
            updatedAt: new Date(),
            highlightColor: result.data.highlightColor as HighlightColorType,
        },
        create: {
            name: result.data.name,
            alias: result.data.alias || null,
            description: result.data.description,
            key: fileKey,
            category: {
                connect: {
                    id: result.data.categoryId,
                }
            },
            updatedAt: new Date(),
            highlightColor: result.data.highlightColor as HighlightColorType,
        },
        include: {
            category: true,
        },
    });

    if (!fileExists) {
        await log("CREATE", "FILE", `Created file ${file.name}`);
    } else {
        await log("UPDATE", "FILE", `Updated file ${file.name}`);
    }

    revalidatePath(`/admin/files/${file.category.id}`);
    revalidatePath(`/admin/files/${file.category.id}/${file.id}`);
    revalidatePath('/admin/files');
    return {file}
}

export const updateFileOrder = async (category: FileCategory, order: OrderItem[]) => {
    for (const item of order) {
        await prisma.file.update({
            where: {id: item.id},
            data: {
                order: item.order,
            },
        });
    }

    await log("UPDATE", "FILE", `Updated file order for category ${category.name}`);

    revalidatePath('/admin/files', 'layout');
    revalidatePath('/publications/downloads');
}

export const deleteFile = async (id: string) => {
    const file = await prisma.file.findUnique({
        where: {id},
        include: {
            category: true,
        },
    });

    if (!file) {
        return;
    }

    await ut.deleteFiles(file.key);

    await prisma.file.delete({
        where: {id},
    });

    await ut.deleteFiles(file.key);
    await log("DELETE", "FILE", `Deleted file ${file.name}`);
    revalidatePath(`/admin/files/${file.category.id}`);
    revalidatePath('/admin/files');
}