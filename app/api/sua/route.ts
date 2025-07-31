import prisma from "@/lib/db";

export async function GET() {

    await prisma.suaBlock.deleteMany({
        where: {
            end: {
                lt: new Date(),
            },
        },
    });

    const suas = await prisma.suaBlock.findMany({
        include: {
            airspace: true,
            user: {
                select: {
                    cid: true,
                },
            },
        },
        omit: {
            userId: true,
        },
        orderBy: {
            start: 'asc',
        },
        take: 10,
    });

    return Response.json(suas);
}