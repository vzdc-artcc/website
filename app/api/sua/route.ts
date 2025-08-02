import prisma from "@/lib/db";

export async function GET() {

    await prisma.suaBlock.deleteMany({
        where: {
            end: {
                lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            },
        },
    })

    const suas = await prisma.suaBlock.findMany({
        include: {
            airspace: true,
            user: {
                select: {
                    cid: true,
                },
            },
        },
        where: {
            start: {
                gte: new Date(),
                lte: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours ago
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