import prisma from "@/lib/db";

export async function GET() {
    const files = await prisma.file.findMany({
        select: {
            key: true,
            name: true,
            updatedAt: true,
        },
    });

    return Response.json(
        files.map((f) => ({
            ...f,
            url: `https://utfs.io/f/${f.key}`,
        }))
    );
}