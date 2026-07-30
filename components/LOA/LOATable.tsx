'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {osmium} from "@/lib/osmium/client";
import {Chip, Tooltip} from "@mui/material";
import {Grading, Info} from "@mui/icons-material";
import LoaDeleteButton from "@/components/LOA/LoaDeleteButton";
import {formatZuluDate} from "@/lib/date";
import {useRouter} from "next/navigation";

const LOA_STATUSES = ['PENDING', 'APPROVED', 'DENIED', 'INACTIVE'];

const getChipColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'APPROVED':
            return 'success';
        case 'DENIED':
            return 'error';
        default:
            return 'default';
    }
}

export default function LoaTable() {

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
            field: 'start',
            headerName: 'Start',
            flex: 1,
            filterable: false,
            sortable: false,
            renderCell: (params) => formatZuluDate(new Date(params.row.start)),
        },
        {
            field: 'end',
            headerName: 'End',
            flex: 1,
            filterable: false,
            sortable: false,
            renderCell: (params) => formatZuluDate(new Date(params.row.end)),
        },
        {
            field: 'status',
            type: 'singleSelect',
            headerName: 'Status',
            flex: 1,
            sortable: false,
            renderCell: params => (
                <Chip size="small" color={getChipColor(params.row.status)} label={params.row.status}/>),
            valueOptions: LOA_STATUSES,
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', flex: 1,
            getActions: (params) => [
                <Tooltip title="View LOA" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={params.row.status === 'PENDING' ? <Grading/> : <Info/>}
                        label="View LOA"
                        onClick={() => router.push(`/admin/loas/${params.row.id}`)}
                    />
                </Tooltip>,
                <LoaDeleteButton key={`delete-${params.row.id}`} loa={params.row} icon admin/>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'status', sort: 'asc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       let cid: number | undefined;
                       let displayName: string | undefined;
                       let status: string | undefined;

                       if (filter && filter.value !== undefined && filter.value !== '') {
                           if (filter.field === 'user') {
                               const value = filter.value as string;
                               const asNumber = Number(value);
                               if (!Number.isNaN(asNumber)) cid = asNumber;
                               else displayName = value;
                           } else if (filter.field === 'status') {
                               status = filter.value as string;
                           }
                       }

                       const {data, error} = await osmium.GET("/api/v1/admin/loa", {
                           params: {
                               query: {
                                   page: pagination.page + 1,
                                   page_size: pagination.pageSize,
                                   cid,
                                   display_name: displayName,
                                   status,
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
