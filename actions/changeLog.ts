// noinspection JSPotentiallyInvalidTargetOfIndexedPropertyAccess

'use server'
import prisma from "@/lib/db";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {Prisma} from '@/generated/prisma/client'

export async function createChangeLog(versionNumber: string, changeLogDetails: string, id?: string) {

    const changeLogZ = z.object({
        versionNumber: z.string().min(1, {message: "You must include a version number."}),
        changeLogDetails: z.string().min(1, {message: "You must include change log details."}),
    });

    const result = changeLogZ.safeParse({
        versionNumber,
        changeLogDetails
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    if (id) {
        const changeLog = await prisma.version.findUnique({
            where: {
                id: id
            },
            include: {
                changeDetails: true,
            }
        })
        try {
            await prisma.version.update({
                where: {id},
                data: {
                    versionNumber: result.data.versionNumber,
                    changeDetails: {
                        update: {
                            where: {
                                id: changeLog!.changeDetails[0].id
                            },
                            data: {
                                detail: result.data.changeLogDetails,
                            }
                        }
                    }
                },
                include: {
                    changeDetails: true,
                }
            })

            revalidatePath('/changelog', "layout");
            return {};
        }catch (e: any){
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                // The .code property can be accessed in a type-safe manner
                if (e.code === 'P2002') {
                  return {errors: `There is a unique constraint violation in versionNumber`}
                }
            }
            return {errors: "Error in updating change log"}
        }

    }
    else {
        try {
            await prisma.version.create({
                data: {
                    versionNumber: result.data.versionNumber,
                    changeDetails: {
                        create: {
                            detail: result.data.changeLogDetails,
                        }
                    }
                }
            })

            revalidatePath('/changelog', "layout");

            return {};
        }catch (e: any) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                // The .code property can be accessed in a type-safe manner
                if (e.code === 'P2002') {
                  return {errors: `There is a unique constraint violation in versionNumber`}
                }
            }
            return {errors: "Error in updating change log"}
        }
    }

}

export async function deleteChangeLog(id: string){
    await prisma.version.delete({
        where: {id},
        include: {
            changeDetails: true,
        }
    });

    revalidatePath('/changelog', "layout");

    return {};
}

