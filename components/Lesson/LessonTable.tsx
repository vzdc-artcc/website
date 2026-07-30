'use client';
import React from 'react';
import {Box, Tooltip} from "@mui/material";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {Edit, Visibility} from "@mui/icons-material";
import LessonDeleteButton from "@/components/Lesson/LessonDeleteButton";
import {useRouter} from "next/navigation";
import {useTrainingLessons} from "@/lib/osmium/hooks/training";
import {useCoarseRoles} from "@/lib/osmium/coarseRoles";

export default function LessonTable() {

    const router = useRouter();
    const {data, isLoading} = useTrainingLessons();
    const rows = data?.items ?? [];
    const {isStaff} = useCoarseRoles();

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
        },
        {
            field: 'identifier',
            headerName: 'Identifier',
            flex: 1,
        },
        {
            field: 'facility',
            headerName: 'Facility',
            flex: 1,
        },
        {
            field: 'position',
            headerName: 'Position',
            flex: 1,
        },
        {field: 'instructor_only', headerName: 'OTS', type: 'boolean', flex: 1},
        {field: 'notify_instructor_on_pass', headerName: 'Notify Instructors On Pass', type: 'boolean', flex: 1},
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 1,
            getActions: (params) => [
                <Tooltip title="View Lesson" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Visibility/>}
                        label="View Lesson"
                        onClick={() => router.push(`/training/lessons/${params.row.id}`)}
                    />
                </Tooltip>,
                isStaff ? (
                    <>
                        <Tooltip title="Edit Lesson" key={`edit-${params.row.id}`}>
                            <GridActionsCellItem
                                icon={<Edit/>}
                                label="Edit Lesson"
                                onClick={() => router.push(`/training/lessons/${params.row.id}/edit`)}
                            />
                        </Tooltip>
                        <LessonDeleteButton lesson={params.row} key={`delete-${params.row.id}`}/>
                    </>
                ) : <></>,
            ],
        },
    ];

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%'}}>
            <DataGrid
                loading={isLoading}
                columns={columns}
                rows={rows}
                initialState={{
                    sorting: {sortModel: [{field: 'identifier', sort: 'asc'}]},
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );

}
