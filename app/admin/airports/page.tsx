import React from 'react';
import prisma from "@/lib/db";
import {
    Box,
    Card,
    CardContent,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import Link from "next/link";
import {Add, Edit} from "@mui/icons-material";
import AirportDeleteButton from "@/components/Airports/AirportDeleteButton";
import TraconGroupForm from "@/components/Airports/TraconGroupForm";
import TraconGroupDeleteButton from "@/components/Airports/TraconGroupDeleteButton";

export default async function Page() {

    const traconGroups = await prisma.traconGroup.findMany({
        include: {
            airports: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Airports</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2,}}>New TRACON Group</Typography>
                    <TraconGroupForm/>
                </CardContent>
            </Card>
            {traconGroups.map((group) => (
                <Card key={group.id}>
                    <CardContent>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1
                            }}>
                            <Typography variant="h6">{group.name}</Typography>
                            <Box>
                                <Tooltip title="Add airport">
                                    <Link href={`/admin/airports/airport/new?traconGroupId=${group.id}`}
                                          style={{color: 'inherit',}}>
                                        <IconButton>
                                            <Add/>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                                <Tooltip title="Edit TRACON group">
                                    <Link href={`/admin/airports/tracon-group/${group.id}`} style={{color: 'inherit',}}>
                                        <IconButton>
                                            <Edit/>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                                <TraconGroupDeleteButton traconGroup={group}/>
                            </Box>

                        </Stack>
                        <TableContainer sx={{maxHeight: 500,}}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ICAO</TableCell>
                                        <TableCell>IATA</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>City</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {group.airports.map((airport) => (
                                        <TableRow key={airport.icao}>
                                            <TableCell>{airport.icao}</TableCell>
                                            <TableCell>{airport.iata}</TableCell>
                                            <TableCell>{airport.name}</TableCell>
                                            <TableCell>{airport.city}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit">
                                                    <Link href={`/admin/airports/airport/${airport.id}`}
                                                          style={{color: 'inherit',}}>
                                                        <IconButton>
                                                            <Edit/>
                                                        </IconButton>
                                                    </Link>
                                                </Tooltip>
                                                <AirportDeleteButton airport={airport}/>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}