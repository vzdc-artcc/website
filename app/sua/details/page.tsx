import React from 'react';
import {Card, CardContent, Container, Divider, Typography} from "@mui/material";
import {Metadata} from "next";
import prisma from "@/lib/db";
import ErrorCard from "@/components/Error/ErrorCard";
import {formatZuluDate} from "@/lib/date";

export const metadata: Metadata = {
    title: 'Special Use Airspace | vZDC',
    description: 'vZDC special use airspace details page',
};

export default async function Page({searchParams}: { searchParams: Promise<{ missionId?: string }> }) {

    const {missionId} = await searchParams;

    const suaBlock = await prisma.suaBlock.findUnique({
        where: {id: missionId},
        include: {
            airspace: true,
        },
    });

    if (!suaBlock) {
        return <ErrorCard heading="Special Use Airspace Request" message="Mission not found."/>
    }

    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Mission Information</Typography>
                    <Typography variant="body1">Mission Number: <b>{suaBlock.missionNumber}</b></Typography>
                    <Typography variant="caption" color="red">Save this page for future reference.</Typography>
                    <Divider sx={{my: 2,}}/>
                    <Typography variant="h6" gutterBottom>Details</Typography>
                    <Typography>{formatZuluDate(suaBlock.start)} - {formatZuluDate(suaBlock.end)}</Typography>
                    <Typography>Affiliated with {suaBlock.afiliation}</Typography>
                    <ul>
                        {suaBlock.airspace.map((a) => (
                            <li key={a.id}>
                                <Typography variant="body1">
                                    <b>{a.identifier}</b>: FL{a.bottomAltitude} - FL{a.topAltitude}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>Extra Information:</Typography>
                    <Typography>{suaBlock.details}</Typography>
                    <Divider sx={{my: 2,}}/>
                    <Typography variant="h6" gutterBottom>Disclaimer</Typography>
                    <Typography variant="body2">
                        This mission is not a guarantee of ATC coverage, nor can it be modified after submitting. Please
                        check the vZDC website for current staffing
                        and availability. The information contained on this page will be shared with vZDC
                        controllers. <b>You must mention your mission number when contacting ATC for clearance to
                        utilize this mission. </b>If your mission number contains a letter, it indicates that you booked
                        your mission less than 24 hours in advance. Honoring of your mission is at the controller&apos;s
                        discretion, and you may be asked to adjust or cancel your mission if necessary. This mission
                        will be deleted after the end time. If you have any questions or concerns, please contact the
                        vZDC staff.
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );

}