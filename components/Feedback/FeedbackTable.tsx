'use client';
import React from 'react';
import {getGridNumericOperators, getGridSingleSelectOperators, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {fetchFeedback} from "@/actions/feedback";
import {FeedbackStatus} from "@/generated/prisma/browser";
import {Grading, Info} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {formatZuluDate} from "@/lib/date";
import {Chip, Rating, Tooltip} from "@mui/material";

const ratingFilterOperators = getGridNumericOperators().filter(
    (operator) => !['isEmpty', 'isNotEmpty', 'isAnyOf'].includes(operator.value)
);

const getChipColor = (status: FeedbackStatus) => {
    switch (status) {
        case FeedbackStatus.PENDING:
            return 'warning';
        case FeedbackStatus.RELEASED:
            return 'success';
        case FeedbackStatus.STASHED:
            return 'error';
        default:
            return 'default';
    }
}

export default function FeedbackTable() {
    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'submittedAt',
            headerName: 'Submitted',
            flex: 1,
            filterable: false,
            valueFormatter: (params) => formatZuluDate(params)
        },
        {
            field: 'controller',
            headerName: 'Controller',
            flex: 1,
            sortable: false,
            renderCell: (params) => `${params.row.controller.firstName} ${params.row.controller.lastName}`,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator]
        },
        {
            field: 'pilot',
            headerName: 'Pilot',
            flex: 1,
            sortable: false,
            renderCell: (params) => `${params.row.pilot.firstName} ${params.row.pilot.lastName}`,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator]
        },
        {
            field: 'controllerPosition',
            headerName: 'Position Staffed',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator]
        },
        {
            field: 'rating',
            headerName: 'Rating',
            flex: 1,
            type: 'number',
            renderCell: (params) => (<Rating value={params.row.rating} readOnly/>),
            filterOperators: ratingFilterOperators
        },
        {
            field: 'status',
            type: 'singleSelect',
            headerName: 'Status',
            flex: 1,
            renderCell: params => (
                <Chip size="small" color={getChipColor(params.row.status)} label={params.row.status}/>),
            filterOperators: getGridSingleSelectOperators().filter((operator) => operator.value === 'is'),
            valueOptions: Object.keys(FeedbackStatus),
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', flex: 1,
            getActions: (params) => [
                <Tooltip title="View Feedback" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={params.row.status === FeedbackStatus.PENDING ? <Grading/> : <Info/>}
                        label="View Feedback"
                        onClick={() => router.push(`/admin/feedback/${params.row.id}`)}
                    />
                </Tooltip>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'submittedAt', sort: 'desc'}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       const feedback = await fetchFeedback(pagination, sortModel, filter);
                       return {
                           data: feedback[1],
                           rowCount: feedback[0],
                       };
                   }}/>
    );
}