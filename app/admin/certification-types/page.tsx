import React from 'react';
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
import prisma from "@/lib/db";
import {Add, Block, Edit, Reorder} from "@mui/icons-material";
import Link from "next/link";
import CertificationTypeDeleteButton from "@/components/CertificationTypes/CertificationTypeDeleteButton";

export default async function Page() {

    const certificationTypes = await prisma.certificationType.findMany({
        orderBy: {
            order: 'asc',
        },
        include: {
            soloCertifications: true,
        }
    });

    return (
        <Card>
            <CardContent>
                <Stack direction={{xs: 'column', md: 'row',}} spacing={2} justifyContent="space-between">
                    <Typography variant="h5">Certification Types</Typography>
                    <Box>
                        <Link href="/admin/certification-types/order" style={{color: 'inherit',}}>
                            <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                    sx={{mr: 1,}}>Order</Button>
                        </Link>
                        <Link href="/admin/certification-types/new">
                            <Button variant="contained" size="large" startIcon={<Add/>}>New Certification Type</Button>
                        </Link>
                    </Box>
                </Stack>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Active Solo Endorsements</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {certificationTypes.map((certificationType) => (
                                <TableRow key={certificationType.id}>
                                    <TableCell>{certificationType.name}</TableCell>
                                    <TableCell>{certificationType.canSoloCert ? certificationType.soloCertifications.length :
                                        <Block/>}</TableCell>
                                    <TableCell>
                                        <Link href={`/admin/certification-types/edit/${certificationType.id}`}
                                              style={{color: 'inherit',}}>
                                            <IconButton>
                                                <Edit/>
                                            </IconButton>
                                        </Link>
                                        <CertificationTypeDeleteButton certificationType={certificationType}/>
                                    </TableCell>
                                </TableRow>
                            ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

            </CardContent>
        </Card>
    );
}