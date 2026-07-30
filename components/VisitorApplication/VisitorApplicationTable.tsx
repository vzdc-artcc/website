'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {osmium} from "@/lib/osmium/client";
import {Grading, Info} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {formatZuluDate} from "@/lib/date";
import {Chip, Link, Tooltip} from "@mui/material";

const STATUSES = ['PENDING', 'APPROVED', 'DENIED'];

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

export default function VisitorApplicationTable() {

    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'submittedAt',
            headerName: 'Submitted',
            flex: 1,
            filterable: false,
            sortable: false,
            renderCell: (params) => formatZuluDate(new Date(params.row.submitted_at)),
        },
        {
            field: 'user',
            headerName: 'User',
            flex: 1,
            sortable: false,
            renderCell: (params) => {
                return (
                    <Link href={`https://vatusa.net/mgt/controller/${params.row.cid}`} target="_blank"
                                              style={{textDecoration: 'none',}}>
                        <Chip
                                key={params.row.id}
                                label={`${params.row.display_name} (${params.row.cid})` || 'Unknown'}
                                size="small"
                                color='info'
                                style={{margin: '2px'}}
                            />
                    </Link>
                )
            },
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'homeFacility',
            headerName: 'Home Facility',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.home_facility,
            filterOperators: containsOnlyFilterOperator,
        },
        {
            field: 'status',
            headerName: 'Status',
            type: 'singleSelect',
            valueOptions: STATUSES,
            flex: 1,
            sortable: false,
            renderCell: params => (
                <Chip size="small" color={getChipColor(params.row.status)} label={params.row.status}/>),
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', flex: 1,
            getActions: (params) => [
                <Tooltip title="View Application" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={params.row.status === 'PENDING' ? <Grading/> : <Info/>}
                        label="View Application"
                        onClick={() => router.push(`/admin/visitor-applications/${params.row.id}`)}
                    />
                </Tooltip>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'submittedAt', sort: 'desc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       let cid: number | undefined;
                       let displayName: string | undefined;
                       let homeFacility: string | undefined;
                       let status: string | undefined;

                       if (filter && filter.value !== undefined && filter.value !== '') {
                           if (filter.field === 'user') {
                               const value = filter.value as string;
                               const asNumber = Number(value);
                               if (!Number.isNaN(asNumber)) cid = asNumber;
                               else displayName = value;
                           } else if (filter.field === 'homeFacility') {
                               homeFacility = filter.value as string;
                           } else if (filter.field === 'status') {
                               status = filter.value as string;
                           }
                       }

                       const {data, error} = await osmium.GET("/api/v1/admin/visitor-applications", {
                           params: {
                               query: {
                                   page: pagination.page + 1,
                                   page_size: pagination.pageSize,
                                   cid,
                                   display_name: displayName,
                                   home_facility: homeFacility,
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
