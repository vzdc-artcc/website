import prisma from "@/lib/db";
import {notFound, permanentRedirect} from "next/navigation";

export default async function Page({params}: { params: Promise<{ alias: string }>, }) {

    const {alias} = await params;

    const file = await prisma.file.findUnique({
        where: {alias},
        select: {id: true, key: true,},
    });

    if (!file) {
        notFound();
    }

    permanentRedirect(`https://utfs.io/f/${file.key}`);
}