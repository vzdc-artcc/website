'use client';
import React from 'react';
import {useRouter} from "next/navigation";
import {Box, Chip, Tooltip} from "@mui/material";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {Edit, Layers, Visibility} from "@mui/icons-material";
import TrainingProgressionDeleteButton from "@/components/TrainingProgression/TrainingProgressionDeleteButton";
import {useProgressionAssignments, useTrainingProgressionSteps, useTrainingProgressions} from "@/lib/osmium/hooks/training";
import {useCoarseRoles} from "@/lib/osmium/coarseRoles";

export default function TrainingProgressionTable() {

    const {isStaff: allowEdit} = useCoarseRoles();
    const router = useRouter();
    const {data, isLoading} = useTrainingProgressions();
    const {data: stepsData} = useTrainingProgressionSteps();
    const {data: assignmentsData} = useProgressionAssignments();

    const progressions = data?.items ?? [];
    const steps = stepsData?.items ?? [];
    const assignments = assignmentsData?.items ?? [];

    const rows = progressions.map((p) => ({
        ...p,
        stepCount: steps.filter((s) => s.progression_id === p.id).length,
        studentCount: assignments.filter((a) => a.progression_id === p.id).length,
        nextProgression: progressions.find((np) => np.id === p.next_progression_id) || null,
    }));

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: 'Name',
        },
        {
            field: 'stepCount',
            type: 'number',
            flex: 1,
            headerName: 'Steps',
        },
        {
            field: 'studentCount',
            type: 'number',
            flex: 1,
            headerName: 'Students',
        },
        {
            field: 'nextProgression',
            flex: 1,
            headerName: 'Next Progression',
            renderCell: (params) => {
                return params.row.nextProgression ? (
                    <Chip
                        key={params.row.nextProgression.id}
                        label={params.row.nextProgression.name}
                        size="small"
                    />
                ) : '';
            },
        },
        {
            field: 'auto_assign_new_home_obs',
            flex: 1,
            headerName: 'Auto Assign New Home OBS',
            type: 'boolean',
        },
        {
            field: 'auto_assign_new_visitor',
            flex: 1,
            headerName: 'Auto Assign New Visitor',
            type: 'boolean',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            getActions: (params) => [
                <Tooltip title="View Training Progression" key={`${params.row.id}-view`}>
                    <GridActionsCellItem
                        icon={<Visibility/>}
                        label="View Training Progression"
                        onClick={() => router.push(`/training/progressions/${params.row.id}`)}
                    />
                </Tooltip>,
                allowEdit ? (
                    <Tooltip title="Progression Steps" key={`${params.row.id}-steps`}>
                        <GridActionsCellItem
                            icon={<Layers/>}
                            label="Progression Steps"
                            onClick={() => router.push(`/training/progressions/${params.row.id}/edit/steps`)}
                        />
                    </Tooltip>
                ) : <></>,
                allowEdit ? (
                    <Tooltip title="Edit" key={`${params.row.id}-edit`}>
                        <GridActionsCellItem
                            icon={<Edit/>}
                            label="Edit"
                            onClick={() => router.push(`/training/progressions/${params.row.id}/edit`)}
                        />
                    </Tooltip>
                ) : <></>,
                allowEdit ? <TrainingProgressionDeleteButton trainingProgression={params.row}
                                                             key={`${params.row.id}-delete`}/> : <></>,
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
                    sorting: {sortModel: [{field: 'name', sort: 'asc'}]},
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );

}
