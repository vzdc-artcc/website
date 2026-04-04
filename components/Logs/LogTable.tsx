'use client';
import React from 'react';
import {getGridSingleSelectOperators, GridColDef} from "@mui/x-data-grid";
import {fetchLogs} from "@/actions/log";
import {LogModel, LogType} from "@/generated/prisma/browser";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";

export default function LogTable({onlyModels}: { onlyModels?: LogModel[], }) {

    const columns: GridColDef[] = [
        {
            field: 'timestamp',
            flex: 1,
            headerName: 'Timestamp',
            type: 'dateTime',
            filterable: false,
        },
        {
            field: 'user',
            flex: 1,
            headerName: 'User',
            renderCell: (params) => `${params.row.user?.firstName} ${params.row.user?.lastName} (${params.row.user?.cid})` || 'Unknown',
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'type',
            flex: 1,
            type: 'singleSelect',
            valueOptions: Object.keys(LogType).map((model) => ({value: model, label: model})),
            headerName: 'Type',
            sortable: false,
            filterOperators: getGridSingleSelectOperators().filter((operator) => operator.value === 'is'),
        },
        {
            field: 'model',
            flex: 1,
            type: 'singleSelect',
            valueOptions: onlyModels?.map((model) => ({
                value: model,
                label: model
            })) || Object.keys(LogModel).map((model) => ({value: model, label: model})),
            headerName: 'Model',
            width: 200,
            sortable: false,
            filterOperators: getGridSingleSelectOperators().filter((operator) => operator.value === 'is'),
        },
        {
            field: 'message',
            flex: 2,
            headerName: 'Message',
            width: 400,
            sortable: false,
            filterable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
    ];

    return (
        <DataTable
            columns={columns}
            initialPagination={{page: 0, pageSize: 20}}
            initialSort={[{field: 'timestamp', sort: 'desc'}]}
            fetchData={async (pagination, sortModel, filter) => {
                const fetchedLogs = await fetchLogs(pagination, sortModel, filter, onlyModels);
                return {data: fetchedLogs[1], rowCount: fetchedLogs[0]};
            }}
        />
    );
}