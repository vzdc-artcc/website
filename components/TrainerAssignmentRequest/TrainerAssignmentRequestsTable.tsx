'use client';
import React from 'react';
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {Visibility} from "@mui/icons-material";
import {Box, Chip, Stack, Tooltip} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import TrainerAssignmentRequestDeleteButton
    from "@/components/TrainerAssignmentRequest/TrainerAssignmentRequestDeleteButton";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useTrainingAssignmentRequests} from "@/lib/osmium/hooks/training";
import {useHasStaffPosition} from "@/lib/osmium/hooks/staff-positions";

export default function TrainerAssignmentRequestsTable({controllerStatus}: {
    controllerStatus: 'HOME' | 'VISITOR',
}) {

    const {has: manageMode} = useHasStaffPosition(['TA', 'ATA', 'WM']);
    const router = useRouter();
    const {data, isLoading} = useTrainingAssignmentRequests();
    const rows = (data?.items ?? []).filter((r) => r.student_controller_status === controllerStatus);

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
            field: 'cid',
            flex: 1,
            headerName: 'CID',
            sortable: false,
            renderCell: (params) => params.row.student_cid,
        },
        {
            field: 'interestedTrainers',
            flex: 1,
            headerName: 'Interested Trainers',
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    {params.row.interested_trainers.map((trainer: { id: string, cid: number, name: string }) => (
                        <Link key={trainer.id} href={`/training/controller/${trainer.cid}`} target="_blank">
                            <Chip label={trainer.name} size="small"/>
                        </Link>
                    ))}
                </Stack>
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
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <GridActionsCellItem
                    key={`view-${params.row.id}`}
                    icon={<Visibility/>}
                    label="View Request"
                    onClick={() => router.push(`/training/requests/${params.row.id}`)}
                />,
                manageMode
                    ? <TrainerAssignmentRequestDeleteButton key={`delete-${params.row.id}`} request={params.row}/>
                    : <></>,
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
