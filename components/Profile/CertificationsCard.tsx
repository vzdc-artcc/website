'use client';
import React from 'react';
import {
    Card,
    CardContent,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {getIconForCertificationOption} from "@/lib/certification";
import {useMe} from "@/lib/osmium/hooks/me";
import {useUserCertifications, useUserSoloCertifications} from "@/lib/osmium/hooks/certifications";

export default function CertificationsCard() {

    const {data: me} = useMe();
    const cid = me?.cid;
    const {data: certsData, isLoading} = useUserCertifications(cid);
    const {data: soloData} = useUserSoloCertifications(cid);

    const certifications = certsData?.items ?? [];
    const solos = soloData?.items ?? [];

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography variant="h6">Certifications</Typography>
                <TableContainer sx={{maxHeight: 500,}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Certification</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={2}><Skeleton height={30}/></TableCell>
                                </TableRow>
                            )}
                            {certifications.map((certification) => {
                                const solo = solos.find((s) => s.certification_type_id === certification.certification_type_id);
                                const option = solo ? 'SOLO' : certification.certification_option;
                                return (
                                    <TableRow key={certification.certification_type_id}>
                                        <TableCell>{certification.certification_type_name}</TableCell>
                                        <TableCell>
                                            {getIconForCertificationOption(option, solo ?? undefined)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

            </CardContent>
        </Card>
    );
}
