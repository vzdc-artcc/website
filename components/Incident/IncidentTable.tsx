'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {osmium} from "@/lib/osmium/client";
import {Tooltip} from "@mui/material";
import {Info} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {formatZuluDate} from "@/lib/date";

export default function IncidentTable() {
    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'reporter_name',
            headerName: 'Reporter',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.reporter_cid
                ? `${params.row.reporter_name} (${params.row.reporter_cid})`
                : (params.row.reporter_name || 'Unknown'),
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'reportee_name',
            headerName: 'Reportee',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.reportee_cid
                ? `${params.row.reportee_name} (${params.row.reportee_cid})`
                : (params.row.reportee_name || 'Unknown'),
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            filterable: false,
            sortable: false,
            flex: 1,
            valueFormatter: (params) => formatZuluDate(params)
        },
        {field: 'closed', headerName: 'Closed', type: 'boolean', flex: 1, sortable: false},
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
                       let reporterCid: number | undefined;
                       let reporterName: string | undefined;
                       let reporteeCid: number | undefined;
                       let reporteeName: string | undefined;
                       let closed: boolean | undefined;

                       if (filter && filter.value !== undefined && filter.value !== '') {
                           const value = filter.value as string;
                           switch (filter.field) {
                               case 'reporter_name': {
                                   const asNumber = Number(value);
                                   if (!Number.isNaN(asNumber)) reporterCid = asNumber;
                                   else reporterName = value;
                                   break;
                               }
                               case 'reportee_name': {
                                   const asNumber = Number(value);
                                   if (!Number.isNaN(asNumber)) reporteeCid = asNumber;
                                   else reporteeName = value;
                                   break;
                               }
                               case 'closed':
                                   closed = value === 'true';
                                   break;
                           }
                       }

                       const {data, error} = await osmium.GET("/api/v1/admin/incidents", {
                           params: {
                               query: {
                                   page: pagination.page + 1,
                                   page_size: pagination.pageSize,
                                   closed,
                                   reporter_cid: reporterCid,
                                   reporter_name: reporterName,
                                   reportee_cid: reporteeCid,
                                   reportee_name: reporteeName,
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
