'use client';
import React from 'react';
import {Box, Chip} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import TrainingProgressionStepDeleteButton
    from "@/components/TrainingProgressionStep/TrainingProgressionStepDeleteButton";
import TrainingProgressionStepEditButton from "@/components/TrainingProgressionStep/TrainingProgressionStepEditButton";
import {useTrainingLessons, useTrainingProgressionSteps} from "@/lib/osmium/hooks/training";

export default function TrainingProgressionStepTable({trainingProgression}: {
    trainingProgression: { id: string },
}) {

    const {data: stepsData, isLoading} = useTrainingProgressionSteps();
    const {data: lessonsData} = useTrainingLessons();
    const lessons = lessonsData?.items ?? [];

    const rows = (stepsData?.items ?? [])
        .filter((s) => s.progression_id === trainingProgression.id)
        .map((s) => ({
            ...s,
            lesson: lessons.find((l) => l.id === s.lesson_id) || null,
        }));

    const columns: GridColDef[] = [
        {
            field: 'lesson',
            flex: 1,
            headerName: 'Lesson',
            renderCell: (params) => (
                <Chip
                    key={params.row.lesson_id}
                    label={params.row.lesson?.identifier ?? 'Unknown'}
                    size="small"
                />
            ),
        },
        {
            field: 'optional',
            flex: 1,
            headerName: 'Optional',
            type: 'boolean',
        },
        {
            field: 'sort_order',
            flex: 1,
            headerName: 'Order',
            type: 'number',
        },
        {
            field: 'actions',
            type: 'actions',
            flex: 1,
            headerName: 'Actions',
            getActions: (params) => [
                <TrainingProgressionStepEditButton trainingProgression={trainingProgression}
                                                   trainingProgressionStep={params.row}
                                                   key={`${params.row.id}-edit`}/>,
                <TrainingProgressionStepDeleteButton trainingProgressionStep={params.row}
                                                     key={`${params.row.id}-delete`}/>,
            ],
        }
    ];

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%'}}>
            <DataGrid
                loading={isLoading}
                columns={columns}
                rows={rows}
                initialState={{
                    sorting: {sortModel: [{field: 'sort_order', sort: 'asc'}]},
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );

}
