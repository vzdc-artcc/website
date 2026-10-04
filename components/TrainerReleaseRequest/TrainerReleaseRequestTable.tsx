'use client';
import React from 'react';
import {Box, Chip, Tooltip} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {formatZuluDate} from "@/lib/date";
import TrainerReleaseRequestApproveButton from "@/components/TrainerReleaseRequest/TrainerReleaseRequestApproveButton";
import TrainerReleaseDeleteButton from "@/components/TrainerReleaseRequest/TrainerReleaseDeleteButton";
import Link from "next/link";
import {useTrainerReleaseRequests} from "@/lib/osmium/hooks/training";
import {useHasPermission} from "@/lib/osmium/permissions";

export default function TrainerReleaseRequestTable() {

    const {allowed: canApprove} = useHasPermission('training.release_requests.decide');
    const {allowed: canDelete} = useHasPermission('training.release_requests.delete');
    const {data, isLoading} = useTrainerReleaseRequests();
    const rows = data?.items ?? [];

    const columns: GridColDef[] = [
        {
            field: 'student',
            flex: 1,
            headerName: 'Student',
            renderCell: (params) => (
                <Tooltip title={params.row.student_controller_status}>
                    <Link href={`/training/controller/${params.row.student_cid}`} target="_blank"
                          style={{textDecoration: 'none',}}>
                        <Chip label={params.row.student_name} size="small"/>
                    </Link>
                </Tooltip>
            ),
            sortable: false,
        },
        {
            field: 'submitted_at',
            flex: 1,
            headerName: 'Submitted At',
            valueFormatter: (value) => formatZuluDate(new Date(value)),
        },
        {
            field: 'status',
            flex: 1,
            headerName: 'Status',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                ...(canApprove ? [<TrainerReleaseRequestApproveButton key={`approve-${params.row.id}`} requestId={params.row.id}/>] : []),
                ...(canDelete ? [<TrainerReleaseDeleteButton key={`delete-${params.row.id}`} requestId={params.row.id}/>] : []),
            ],
            flex: 1,
        },
    ];

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%'}}>
            <DataGrid
                loading={isLoading}
                columns={columns}
                rows={rows}
                initialState={{
                    sorting: {sortModel: [{field: 'submitted_at', sort: 'asc'}]},
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );
}
