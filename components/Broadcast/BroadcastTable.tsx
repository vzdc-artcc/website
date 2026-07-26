'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {osmium} from "@/lib/osmium/client";
import {Tooltip} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import BroadcastDeleteButton from "@/components/Broadcast/BroadcastDeleteButton";
import {formatZuluDate} from "@/lib/date";

export default function BroadcastTable() {

    const router = useRouter();
    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'Title',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'timestamp',
            headerName: 'Updated At',
            filterable: false,
            flex: 1,
            renderCell: (params) => formatZuluDate(params.row.timestamp),
        },
        {
            field: 'file_filename',
            headerName: 'File',
            filterable: false,
            flex: 1,
            renderCell: (params) => params.row.file_filename || '',
        },
        {
            field: 'exempt_staff',
            type: 'boolean',
            headerName: 'Exempt Staff',
            flex: 1,
        },
        {
            field: 'reviewed',
            headerName: 'Reviewed',
            flex: 1,
            sortable: false,
            renderCell: (params) => `${params.row.agreed_count} reviewed / ${params.row.seen_count} seen`,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            getActions: (params) => [
                <Tooltip title="View / Edit Broadcast" key={`edit-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Edit/>}
                        label="View / Edit Broadcast"
                        onClick={() => router.push(`/admin/broadcasts/${params.row.id}`)}
                    />
                </Tooltip>,
                <BroadcastDeleteButton key={`deletebtn-${params.row.id}`} broadcast={params.row}/>,
            ],
        }
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'timestamp', sort: 'desc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       let title: string | undefined;
                       let exemptStaff: boolean | undefined;

                       if (filter && filter.value !== undefined && filter.value !== '') {
                           const value = filter.value as string;
                           if (filter.field === 'title') title = value;
                           if (filter.field === 'exempt_staff') exemptStaff = value === 'true';
                       }

                       const {data, error} = await osmium.GET("/api/v1/admin/broadcasts", {
                           params: {
                               query: {
                                   page: pagination.page + 1,
                                   page_size: pagination.pageSize,
                                   title,
                                   exempt_staff: exemptStaff,
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
