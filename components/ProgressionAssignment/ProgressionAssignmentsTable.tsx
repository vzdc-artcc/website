'use client';
import React from 'react';
import {Box, Chip, Tooltip} from "@mui/material";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import Link from "next/link";
import ProgressionAssignmentDeleteButton from "@/components/ProgressionAssignment/ProgressionAssignmentDeleteButton";
import {Edit} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {useProgressionAssignments} from "@/lib/osmium/hooks/training";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useCoarseRoles} from "@/lib/osmium/coarseRoles";

export default function ProgressionAssignmentsTable() {

    const {isStaff: allowEdit} = useCoarseRoles();
    const router = useRouter();
    const {data, isLoading} = useProgressionAssignments();
    const {data: rosterData} = useRosterControllers();

    const controllerStatusByCid = new Map((rosterData?.items ?? []).map((u) => [u.basic.cid, u.full?.controller_status]));

    const rows = data?.items ?? [];

    const columns: GridColDef[] = [
        {
            field: 'display_name',
            flex: 1,
            headerName: 'Student',
            renderCell: (params) => {
                const status = params.row.cid ? controllerStatusByCid.get(params.row.cid) : undefined;
                const color = status === "HOME" ? 'default' : 'secondary';

                return (
                    <Tooltip title={status ?? ''}>
                        <Link href={`/training/controller/${params.row.cid}`} target="_blank"
                              style={{textDecoration: 'none',}}>
                            <Chip
                                label={params.row.display_name || 'Unknown'}
                                size="small"
                                color={color}
                            />
                        </Link>
                    </Tooltip>
                )
            },
            sortable: false,
        },
        {
            field: 'progression_name',
            flex: 1,
            headerName: 'Progression',
            renderCell: (params) => (
                <Chip
                    label={params.row.progression_name}
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 1,
            getActions: (params) => [
                allowEdit ? (
                    <Tooltip title="Edit" key={`${params.row.user_id}-edit`}>
                        <GridActionsCellItem
                            icon={<Edit/>}
                            label="Edit"
                            onClick={() => router.push(`/training/progressions/assignments/${params.row.cid}`)}
                        />
                    </Tooltip>
                ) : <></>,
                allowEdit ?
                    <ProgressionAssignmentDeleteButton user={params.row} key={`${params.row.user_id}-delete`}/> : <></>,
            ],
        }
    ];

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%'}}>
            <DataGrid
                loading={isLoading}
                columns={columns}
                rows={rows}
                getRowId={(row) => row.user_id}
                initialState={{
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );
}
