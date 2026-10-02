import {
    Box,
    Button,
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
    Typography
} from "@mui/material";
import React from 'react';
import prisma from "@/lib/db";
import {formatZuluDate} from "@/lib/date";
import Link from "next/link";
import {Add, Edit, Reorder} from "@mui/icons-material";
import InnovationLabDeleteButton from "@/components/InnovationLab/InnovationLabDeleteButton";

export default async function Page() {

    const projects = await prisma.innovationLabProject.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction={{xs: 'column', md: 'row',}} spacing={2} justifyContent="space-between">
                        <Typography variant="h5">Innovation Lab</Typography>
                        <Box>
                            <Link href="/admin/innovation/order" style={{color: 'inherit',}}>
                                <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                        sx={{mr: 1,}}>Order</Button>
                            </Link>
                            <Link href="/admin/innovation/new">
                                <Button variant="contained" size="large" startIcon={<Add/>}>New Project</Button>
                            </Link>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {projects.length === 0 && <Typography>No innovation lab projects found.</Typography>}
                    {projects.length > 0 && <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Alias (/innovation)</TableCell>
                                    <TableCell>Updated At</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell>{project.name}</TableCell>
                                        <TableCell>/{project.alias}</TableCell>
                                        <TableCell>{formatZuluDate(project.updatedAt)}</TableCell>
                                        <TableCell>{formatZuluDate(project.createdAt)}</TableCell>
                                        <TableCell>
                                            <Link href={`/admin/innovation/${project.id}`}>
                                                <IconButton><Edit/></IconButton>
                                            </Link>
                                            <InnovationLabDeleteButton project={project}/>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
                </CardContent>
            </Card>

        </Stack>

    );
}