'use client';
import React from 'react';
import {Lesson, TrainingProgression} from "@/generated/prisma/browser";
import {GridColDef} from "@mui/x-data-grid";
import {Chip} from "@mui/material";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {fetchTrainingProgressionSteps} from "@/actions/trainingProgressionStep";
import TrainingProgressionStepDeleteButton
    from "@/components/TrainingProgressionStep/TrainingProgressionStepDeleteButton";
import TrainingProgressionStepEditButton from "@/components/TrainingProgressionStep/TrainingProgressionStepEditButton";

export default function TrainingProgressionStepTable({trainingProgression, allLessons}: {
    trainingProgression: TrainingProgression,
    allLessons: Lesson[],
}) {

    const columns: GridColDef[] = [
        {
            field: 'lesson',
            flex: 1,
            headerName: 'Lesson',
            renderCell: (params) => {
                return (
                    <Chip
                        key={params.row.lesson.id}
                        label={params.row.lesson.identifier}
                        size="small"
                    />
                );
            },
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'optional',
            flex: 1,
            headerName: 'Optional',
            type: 'boolean',
            filterOperators: [...equalsOnlyFilterOperator],
        },
        {
            field: 'order',
            flex: 1,
            headerName: 'Order',
            type: 'number',
            filterable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            flex: 1,
            headerName: 'Actions',
            getActions: (params) => [
                <TrainingProgressionStepEditButton trainingProgression={trainingProgression}
                                                   trainingProgressionStep={params.row} allLessons={allLessons}
                                                   key={`${params.row.id}-edit`}/>,
                <TrainingProgressionStepDeleteButton trainingProgressionStep={params.row}
                                                     key={`${params.row.id}-delete`}/>,
            ],
        }
    ];

    return (
        <DataTable
            columns={columns}
            initialSort={[{field: 'order', sort: 'asc',}]}
            fetchData={async (pagination, sortModel, filter,) => {
                const fetchedSteps = await fetchTrainingProgressionSteps(trainingProgression, pagination, sortModel, filter);
                return {data: fetchedSteps[1], rowCount: fetchedSteps[0]};
            }}
        />
    );

}
