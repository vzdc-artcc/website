'use client';
import React from 'react';
import {Box, Chip, Stack, Tooltip} from "@mui/material";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {Visibility} from "@mui/icons-material";
import TrainingAssignmentDeleteButton from "@/components/TrainingAssignment/TrainingAssignmentDeleteButton";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useTrainingAssignments} from "@/lib/osmium/hooks/training";
import {useHasStaffPosition} from "@/lib/osmium/hooks/staff-positions";

export default function TrainingAssignmentTable() {

    const {has: manageMode} = useHasStaffPosition(['TA', 'ATA', 'WM']);
    const router = useRouter();
    const {data, isLoading} = useTrainingAssignments();
    const rows = data?.items ?? [];

    const columns: GridColDef[] = [
        {
            field: 'student',
            flex: 1,
            headerName: 'Student',
            renderCell: (params) => {
                const color = params.row.student_controller_status === "HOME" ? 'default' : 'secondary';
                return (
                    <Tooltip title={params.row.student_controller_status}>
                        <Link href={`/training/controller/${params.row.student_cid}`} target="_blank"
                              style={{textDecoration: 'none',}}>
                            <Chip label={params.row.student_name} size="small" color={color}/>
                        </Link>
                    </Tooltip>
                );
            },
            sortable: false,
        },
        {
            field: 'primaryTrainer',
            headerName: 'Primary Trainer',
            renderCell: (params) => (
                <Link href={`/training/controller/${params.row.primary_trainer_cid}`} target="_blank">
                    <Chip label={params.row.primary_trainer_name} size="small"/>
                </Link>
            ),
            sortable: false,
            flex: 1,
        },
        {
            field: 'otherTrainers',
            headerName: 'Other Trainers',
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    {params.row.other_trainers.map((trainer: { id: string, cid: number, name: string }) => (
                        <Link key={trainer.id} href={`/training/controller/${trainer.cid}`} target="_blank">
                            <Chip label={trainer.name} size="small"/>
                        </Link>
                    ))}
                </Stack>
            ),
            sortable: false,
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            getActions: (params) => [
                <GridActionsCellItem
                    key={`view-${params.row.id}`}
                    icon={<Visibility/>}
                    label="View/Edit Assignment"
                    onClick={() => router.push(`/training/assignments/${params.row.id}`)}
                />,
                manageMode
                    ? <TrainingAssignmentDeleteButton key={`delete-${params.row.id}`} assignment={params.row}/>
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
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );
}
