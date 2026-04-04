import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {fetchCharts} from "@/actions/charts";
import ChartsList from "@/components/Charts/ChartsList";

export default async function AirportInformation({icao}: { icao: string, },) {
    const airport = await prisma.airport.findUnique({
        where: {
            icao,
        },
        include: {
            runways: {
                include: {
                    runwayInstructions: true,
                },
            },
        },
    });

    if (!airport) {
        notFound();
    }

    const charts = await fetchCharts(icao);

    return (
        (<Stack direction="column" spacing={2}>
            <Typography variant="h5" fontWeight={700} textAlign="center">{airport.name} ({airport.iata})</Typography>
            <Grid container spacing={2} columns={2}>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <Card>
                        <CardContent>
                            <ChartsList icao={airport.icao} charts={charts}/>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <Card>
                        <CardContent>
                            <Stack direction="column" spacing={2}>
                                <Typography variant="h6" textAlign="center">{airport.icao} Runways</Typography>
                                {airport.runways.map(runway => (
                                    <Card key={runway.id}>
                                        <CardContent>
                                            <Typography variant="body1" fontWeight={700}
                                                        textAlign="center">Runway {runway.name}</Typography>
                                            <Table size="small" sx={{mt: 1,}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Route</TableCell>
                                                        <TableCell>Expected Procedure</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {runway.runwayInstructions.map((instruction) => (
                                                        <TableRow key={runway.id}>
                                                            <TableCell>{instruction.route}</TableCell>
                                                            <TableCell>{instruction.procedure}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Stack>)
    );
}