'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {fetchIncidents} from "@/actions/incident";
import {Tooltip} from "@mui/material";
import {Info, VisibilityOff} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {formatZuluDate} from "@/lib/date";

export default function IncidentTable() {
    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'reporter',
            headerName: 'Reporter',
            flex: 1,
            sortable: false,
            renderCell: (params) => `${params.row.reporter.firstName} ${params.row.reporter.lastName} (${params.row.reporter.cid})`,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator]
        },
        {
            field: 'reportee',
            headerName: 'Reportee',
            flex: 1,
            sortable: false,
            renderCell: (params) => `${params.row.reportee.firstName} ${params.row.reportee.lastName} (${params.row.reportee.cid})`,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator]
        },
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            filterable: false,
            flex: 1,
            valueFormatter: (params) => formatZuluDate(params)
        },
        {field: 'closed', headerName: 'Closed', type: 'boolean', flex: 1},
        {
            field: 'actions', type: 'actions', headerName: 'Actions', flex: 1,
            getActions: (params) => [
                <Tooltip title="View Incident" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Info/>}
                        label="View Incident"
                        onClick={() => router.push(`/admin/incidents/${params.row.id}`)}
                    />
                </Tooltip>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'timestamp', sort: 'desc'}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       const incidents = await fetchIncidents(pagination, sortModel, filter);
                       return {
                           data: incidents[1],
                           rowCount: incidents[0],
                       };
                   }}/>
    );
}