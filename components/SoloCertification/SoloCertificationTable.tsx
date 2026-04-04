'use client';
import React from 'react';
import {GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {fetchSoloCertifications} from "@/actions/solo";
import SoloCertificationDeleteButton from "@/components/SoloCertification/SoloCertificationDeleteButton";
import {formatZuluDate} from "@/lib/date";
import {CertificationType} from "@/generated/prisma/browser";
import {Chip, Tooltip} from "@mui/material";
import Link from "next/link";

export default function SoloCertificationTable() {

    const columns: GridColDef[] = [
        {
            field: 'controller',
            headerName: 'Controller',
            flex: 1,
            sortable: false,
            renderCell: (params) => {
                return (
                    <Tooltip title={`${params.row.controller.controllerStatus}`}>
                        <Link href={`/admin/controller/${params.row.controller.cid}`} target="_blank"
                              style={{textDecoration: 'none',}}>
                            <Chip
                                key={params.row.controller.id}
                                label={`${params.row.controller.firstName} ${params.row.controller.lastName}` || 'Unknown'}
                                size="small"
                            />
                        </Link>
                    </Tooltip>
                )
            }, filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'certificationType',
            headerName: 'Certification Type',
            valueFormatter: (params: CertificationType) => params.name,
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'position',
            headerName: 'Position',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {field: 'expires', headerName: 'Expires', flex: 1, valueFormatter: (params) => formatZuluDate(params)},
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 1,
            getActions: (params) => [
                <SoloCertificationDeleteButton key={params.row.id} soloCertification={params.row}/>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'expires', sort: 'desc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       const soloCertifications = await fetchSoloCertifications(pagination, sortModel, filter);
                       return {
                           data: soloCertifications[1],
                           rowCount: soloCertifications[0],
                       };
                   }}/>
    );
}