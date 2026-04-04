'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable from "@/components/DataTable/DataTable";
import {fetchLoas} from "@/actions/loa";
import {LOAStatus} from "@/generated/prisma/browser";
import {Chip, Tooltip} from "@mui/material";
import {Grading, Info} from "@mui/icons-material";
import LoaDeleteButton from "@/components/LOA/LoaDeleteButton";
import {formatZuluDate} from "@/lib/date";
import {useRouter} from "next/navigation";
import {User} from "next-auth";

const getChipColor = (status: LOAStatus) => {
    switch (status) {
        case LOAStatus.PENDING:
            return 'warning';
        case LOAStatus.APPROVED:
            return 'success';
        case LOAStatus.DENIED:
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
            valueFormatter: (params: User) => `${params.firstName} ${params.lastName} (${params.cid})`,
        },
        {
            field: 'start',
            headerName: 'Start',
            flex: 1,
            filterable: false,
            valueFormatter: (params) => formatZuluDate(params),
        },
        {
            field: 'end',
            headerName: 'End',
            flex: 1,
            filterable: false,
            valueFormatter: (params) => formatZuluDate(params),
        },
        {
            field: 'status',
            type: 'singleSelect',
            headerName: 'Status',
            flex: 1,
            renderCell: params => (
                <Chip size="small" color={getChipColor(params.row.status)} label={params.row.status}/>),
            valueOptions: Object.keys(LOAStatus)
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', flex: 1,
            getActions: (params) => [
                <Tooltip title="View LOA" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={params.row.status === LOAStatus.PENDING ? <Grading/> : <Info/>}
                        label="View LOA"
                        onClick={() => router.push(`/admin/loas/${params.row.id}`)}
                    />
                </Tooltip>,
                <LoaDeleteButton key={`delete-${params.row.id}`} loa={params.row} icon/>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'status', sort: 'asc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       const loas = await fetchLoas(pagination, sortModel, filter);
                       return {
                           data: loas[1],
                           rowCount: loas[0],
                       };
                   }}/>
    );
}