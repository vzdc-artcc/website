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
        },
        omit: {
            userId: true,
        },
        orderBy: {
            start: 'asc',
        },
    });

    return Response.json(suas);
}