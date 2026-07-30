'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {osmium} from "@/lib/osmium/client";
import {useRouter} from "next/navigation";
import {Visibility} from "@mui/icons-material";
import {Tooltip} from "@mui/material";

export default function StaffingRequestTable() {
    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'user',
            headerName: 'User',
            flex: 1,
            sortable: false,
            renderCell: (params) => `${params.row.display_name} (${params.row.cid})`,
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: (params) => params.row.email,
        },
        {
            field: 'name',
            headerName: 'Proposed Name',
            flex: 1,
            sortable: false,
            filterable: false,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 1,
            getActions: (params) => [
                <Tooltip title="View Staffing Request" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Visibility/>}
                        label="View Staffing Request"
                        onClick={() => router.push(`/events/admin/staffing-requests/${params.row.id}`)}
                    />
                </Tooltip>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'name', sort: 'asc'}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       let cid: number | undefined;
                       let displayName: string | undefined;

                       if (filter && filter.field === 'user' && filter.value) {
                           const value = filter.value as string;
                           const asNumber = Number(value);
                           if (!Number.isNaN(asNumber)) cid = asNumber;
                           else displayName = value;
                       }

                       const {data, error} = await osmium.GET("/api/v1/admin/staffing-requests", {
                           params: {
                               query: {
                                   page: pagination.page + 1,
                                   page_size: pagination.pageSize,
                                   cid,
                                   display_name: displayName,
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
