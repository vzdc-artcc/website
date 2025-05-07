import React from 'react';
import prisma from "@/lib/db";
import {permanentRedirect} from "next/navigation";
import {Button, Card, CardContent, Typography} from "@mui/material";
import Link from "next/link";
import {Home} from "@mui/icons-material";

export default async function Page({params}: { params: Promise<{ alias: string }>, }) {

    const {alias} = await params;

    const file = await prisma.file.findUnique({
        where: {alias},
        select: {id: true,},
    });

    if (!file) {
        return <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>404 - File not found</Typography>
                <Link href="/">
                    <Button variant="contained" startIcon={<Home/>}>Home</Button>
                </Link>
            </CardContent>
        </Card>;
    }

    permanentRedirect(`/publications/${file.id}`);
}