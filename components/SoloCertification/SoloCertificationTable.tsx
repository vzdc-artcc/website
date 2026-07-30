'use client';
import React from 'react';
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import SoloCertificationDeleteButton from "@/components/SoloCertification/SoloCertificationDeleteButton";
import {formatZuluDate} from "@/lib/date";
import {Chip, Tooltip} from "@mui/material";
import Link from "next/link";
import {useAdminSoloCertifications} from "@/lib/osmium/hooks/certifications";

export default function SoloCertificationTable() {

    const {data, isLoading} = useAdminSoloCertifications();
    const rows = data?.items ?? [];

    const columns: GridColDef[] = [
        {
            field: 'display_name',
            headerName: 'Controller',
            flex: 1,
            renderCell: (params) => (
                <Tooltip title={`CID ${params.row.cid}`}>
                    <Link href={`/admin/controller/${params.row.cid}`} target="_blank"
                          style={{textDecoration: 'none',}}>
                        <Chip label={params.row.display_name || 'Unknown'} size="small"/>
                    </Link>
                </Tooltip>
            ),
        },
        {field: 'certification_type_name', headerName: 'Certification Type', flex: 1},
        {field: 'position', headerName: 'Position', flex: 1},
        {
            field: 'expires',
            headerName: 'Expires',
            flex: 1,
            valueFormatter: (value) => formatZuluDate(new Date(value)),
        },
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
        <DataGrid
            autoHeight
            loading={isLoading}
            rows={rows}
            columns={columns}
            initialState={{sorting: {sortModel: [{field: 'expires', sort: 'desc'}]}}}
            pageSizeOptions={[10, 25, 50]}
        />
    );
}
