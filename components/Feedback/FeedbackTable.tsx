'use client';
import React from 'react';
import {getGridNumericOperators, getGridSingleSelectOperators, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {osmium} from "@/lib/osmium/client";
import {Grading, Info} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {formatZuluDate} from "@/lib/date";
import {Chip, Rating, Tooltip} from "@mui/material";

const FEEDBACK_STATUSES = ['PENDING', 'RELEASED', 'STASHED'] as const;

const ratingFilterOperators = getGridNumericOperators().filter(
    (operator) => !['isEmpty', 'isNotEmpty', 'isAnyOf'].includes(operator.value)
);

const getChipColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'RELEASED':
            return 'success';
        case 'STASHED':
            return 'error';
        default:
            return 'default';
    }
}

export default function FeedbackTable() {
    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'submitted_at',
            headerName: 'Submitted',
            flex: 1,
            sortable: false,
            filterable: false,
            valueFormatter: (params) => formatZuluDate(params)
        },
        {
            field: 'target_name',
            headerName: 'Controller',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.target_cid
                ? `${params.row.target_name} (${params.row.target_cid})`
                : (params.row.target_name || 'Unknown'),
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'submitter_name',
            headerName: 'Pilot',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.submitter_cid
                ? `${params.row.submitter_name} (${params.row.submitter_cid})`
                : (params.row.submitter_name || 'Unknown'),
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'controller_position',
            headerName: 'Position Staffed',
            flex: 1,
            sortable: false,
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'rating',
            headerName: 'Rating',
            flex: 1,
            type: 'number',
            sortable: false,
            renderCell: (params) => (<Rating value={params.row.rating} readOnly/>),
            filterOperators: ratingFilterOperators
        },
        {
            field: 'status',
            type: 'singleSelect',
            headerName: 'Status',
            flex: 1,
            sortable: false,
            renderCell: params => (
                <Chip size="small" color={getChipColor(params.row.status)} label={params.row.status}/>),
            filterOperators: getGridSingleSelectOperators().filter((operator) => operator.value === 'is'),
            valueOptions: FEEDBACK_STATUSES as unknown as string[],
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', flex: 1,
            getActions: (params) => [
                <Tooltip title="View Feedback" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={params.row.status === 'PENDING' ? <Grading/> : <Info/>}
                        label="View Feedback"
                        onClick={() => router.push(`/admin/feedback/${params.row.id}`)}
                    />
                </Tooltip>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'submitted_at', sort: 'desc'}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       let targetCid: number | undefined;
                       let targetName: string | undefined;
                       let submitterCid: number | undefined;
                       let submitterName: string | undefined;
                       let controllerPosition: string | undefined;
                       let minRating: number | undefined;
                       let maxRating: number | undefined;
                       let status: string | undefined;

                       if (filter && filter.value !== undefined && filter.value !== '') {
                           const value = filter.value as string;
                           switch (filter.field) {
                               case 'target_name': {
                                   const asNumber = Number(value);
                                   if (!Number.isNaN(asNumber)) targetCid = asNumber;
                                   else targetName = value;
                                   break;
                               }
                               case 'submitter_name': {
                                   const asNumber = Number(value);
                                   if (!Number.isNaN(asNumber)) submitterCid = asNumber;
                                   else submitterName = value;
                                   break;
                               }
                               case 'controller_position':
                                   controllerPosition = value;
                                   break;
                               case 'rating': {
                                   const ratingValue = parseInt(value);
                                   if (!Number.isNaN(ratingValue)) {
                                       switch (filter.operator) {
                                           case '=':
                                               minRating = ratingValue;
                                               maxRating = ratingValue;
                                               break;
                                           case '>':
                                               minRating = ratingValue + 1;
                                               break;
                                           case '>=':
                                               minRating = ratingValue;
                                               break;
                                           case '<':
                                               maxRating = ratingValue - 1;
                                               break;
                                           case '<=':
                                               maxRating = ratingValue;
                                               break;
                                       }
                                   }
                                   break;
                               }
                               case 'status':
                                   status = value;
                                   break;
                           }
                       }

                       const {data, error} = await osmium.GET("/api/v1/feedback", {
                           params: {
                               query: {
                                   page: pagination.page + 1,
                                   page_size: pagination.pageSize,
                                   status,
                                   submitter_cid: submitterCid,
                                   submitter_name: submitterName,
                                   target_cid: targetCid,
                                   target_name: targetName,
                                   controller_position: controllerPosition,
                                   min_rating: minRating,
                                   max_rating: maxRating,
                               },
                           },
                       });
                       if (error) throw error;

                       return {
                           data: data?.items ?? [],
                           rowCount: data?.total ?? 0,
                       };
                   }}/>
    );
}
