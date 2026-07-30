'use client';

import React, {useMemo} from 'react';
import {Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {getIconForCertificationOption} from "@/lib/certification";
import {getRating} from "@/lib/vatsim";
import UserStaffPositionChips from "@/components/StaffPositions/UserStaffPositionChips";
import Link from "next/link";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useCertificationTypes, useRosterCertifications} from "@/lib/osmium/hooks/certifications";
import {getVatusaRosterMerge} from "@/actions/roster";

export default function RosterTable({membership, search, includeVatusa,}: {
    membership: 'home' | 'visit' | 'both',
    search?: string,
    includeVatusa?: boolean,
}) {
    const {data: rosterData, isLoading} = useRosterControllers();

    const rows = useMemo(() => {
        const items = rosterData?.items ?? [];
        const term = (search || '').toLowerCase();

        return items
            .filter((item) => {
                const status = item.full?.controller_status;
                if (membership === 'home') return status === 'HOME';
                if (membership === 'visit') return status === 'VISITOR';
                return status === 'HOME' || status === 'VISITOR';
            })
            .filter((item) => {
                if (!term) return true;
                const profile = item.full;
                const name = profile
                    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`
                    : item.basic.name;
                return name.toLowerCase().includes(term) ||
                    (profile?.preferred_name ?? '').toLowerCase().includes(term) ||
                    item.basic.cid.toString().includes(term);
            })
            .sort((a, b) => {
                const aName = a.full?.last_name ?? a.basic.name;
                const bName = b.full?.last_name ?? b.basic.name;
                return aName.localeCompare(bName);
            });
    }, [rosterData, membership, search]);

    const cids = useMemo(() => rows.map((r) => r.basic.cid.toString()), [rows]);

    const {data: certTypes} = useCertificationTypes();
    const {data: rosterCerts} = useRosterCertifications();

    const {data: vatusaExtra} = useQuery({
        queryKey: ['vatusa-roster-merge', membership, cids.join(',')],
        queryFn: () => getVatusaRosterMerge(membership === 'both' ? 'home' : membership, cids),
        enabled: !!includeVatusa && membership !== 'both',
    });

    const certificationTypes = useMemo(
        () => [...(certTypes?.items ?? [])].sort((a, b) => a.sort_order - b.sort_order),
        [certTypes],
    );
    const colSpan = 2 + certificationTypes.length;
    const noResults = rows.length === 0 && (vatusaExtra?.length ?? 0) === 0;

    if (isLoading) {
        return <Typography>Loading roster…</Typography>;
    }

    return (
        <TableContainer sx={{maxHeight: '100vh',}}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Controller</TableCell>
                        <TableCell>OI</TableCell>
                        {certificationTypes.map((certificationType) => (
                            <TableCell key={certificationType.id}>{certificationType.name}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {noResults &&
                        <TableRow>
                            <TableCell colSpan={colSpan}>
                                <Typography>No results found{search ? ` for ${search}` : ''}</Typography>
                            </TableCell>
                        </TableRow>}
                    {rows.map((item) => {
                        const profile = item.full;
                        const certUser = rosterCerts?.find((u) => u.cid === item.basic.cid);
                        const hasApprovedLoa = certUser?.has_approved_loa ?? false;
                        const displayName = profile?.preferred_name ||
                            [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
                            item.basic.name;

                        return (
                            <TableRow key={item.basic.cid}>
                                <TableCell>
                                    <Link href={`/controllers/${item.basic.cid}`}
                                          style={{color: 'inherit', textDecoration: 'none',}}>
                                        <Typography fontWeight="bold">
                                            {displayName}
                                            {hasApprovedLoa &&
                                                <Chip label="LOA" color="primary" size="small" sx={{ml: 1,}}/>}
                                        </Typography>
                                    </Link>
                                    {profile?.preferred_name &&
                                        <Typography variant="caption">
                                            AKA {profile.first_name} {profile.last_name}
                                        </Typography>}
                                    <Typography variant="body2">
                                        {item.basic.rating ?? 'Unknown'} • {item.basic.cid}
                                    </Typography>
                                    {profile?.controller_status === "HOME" &&
                                        <UserStaffPositionChips cid={item.basic.cid}/>}
                                    {profile?.controller_status === "VISITOR" &&
                                        <Typography>{profile.artcc}</Typography>}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="h5">{profile?.operating_initials}</Typography>
                                </TableCell>
                                {certificationTypes.map((certificationType) => (
                                    <TableCell key={certificationType.id}>
                                        {getIconForCertificationOption(
                                            certUser?.certifications.find((c) => c.certification_type_id === certificationType.id)?.certification_option || "NONE",
                                            certUser?.solos.find((c) => c.certification_type_id === certificationType.id),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                    {(vatusaExtra ?? []).map((vatusaUser) => (
                        <TableRow key={vatusaUser.cid}>
                            <TableCell>
                                <Typography fontWeight="bold">{vatusaUser.fname} {vatusaUser.lname}</Typography>
                                <Typography variant="body2">{getRating(vatusaUser.rating)} • {vatusaUser.cid}</Typography>
                                <Typography variant="subtitle2">
                                    {membership === 'visit' ? vatusaUser.facility : ''}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h5">-</Typography>
                            </TableCell>
                            {certificationTypes.map((certificationType) => (
                                <TableCell key={certificationType.id}>
                                    {getIconForCertificationOption("NONE")}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
