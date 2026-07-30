'use client';
import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {Add, Block, Edit, Reorder} from "@mui/icons-material";
import Link from "next/link";
import CertificationTypeDeleteButton from "@/components/CertificationTypes/CertificationTypeDeleteButton";
import {useAdminSoloCertifications, useCertificationTypes} from "@/lib/osmium/hooks/certifications";

export default function Page() {

    const {data, isLoading} = useCertificationTypes();
    const {data: soloData} = useAdminSoloCertifications();
    const certificationTypes = data?.items ?? [];

    const soloCountByType = new Map<string, number>();
    for (const solo of soloData?.items ?? []) {
        soloCountByType.set(solo.certification_type_id, (soloCountByType.get(solo.certification_type_id) ?? 0) + 1);
    }

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
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={3}><Skeleton height={40}/></TableCell>
                                </TableRow>
                            )}
                            {certificationTypes.map((certificationType) => (
                                <TableRow key={certificationType.id}>
                                    <TableCell>{certificationType.name}</TableCell>
                                    <TableCell>{certificationType.can_solo_cert ? (soloCountByType.get(certificationType.id) ?? 0) :
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
