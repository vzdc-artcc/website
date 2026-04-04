'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {fetchVisitorApplications} from "@/actions/visitor";
import {VisitorApplicationStatus} from "@/generated/prisma/browser";
import {Grading, Info} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {formatZuluDate} from "@/lib/date";
import {Chip, Link, Tooltip} from "@mui/material";

const getChipColor = (status: VisitorApplicationStatus) => {
    switch (status) {
        case VisitorApplicationStatus.PENDING:
            return 'warning';
        case VisitorApplicationStatus.APPROVED:
            return 'success';
        case VisitorApplicationStatus.DENIED:
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
            valueFormatter: (params) => formatZuluDate(params),
        },
        {
            field: 'user',
            headerName: 'User',
            flex: 1,
            sortable: false,
            renderCell: (params) => {
                return (
                    <Link href={`https://vatusa.net/mgt/controller/${params.row.user.cid}`} target="_blank"
                                              style={{textDecoration: 'none',}}>
                        <Chip
                                key={params.row.user.id}
                                label={`${params.row.user.firstName} ${params.row.user.lastName}` || 'Unknown'}
                                size="small"
                                color='info'
                                style={{margin: '2px'}}
                            />
                    </Link>
                )
            },
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'cid',
            headerName: 'CID',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.user.cid,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.user.email,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'homeFacility',
            headerName: 'Home Facility',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'status',
            headerName: 'Status',
            type: 'singleSelect',
            valueOptions: Object.keys(VisitorApplicationStatus).map((type) => ({value: type, label: type})),
            flex: 1,
            renderCell: params => (
                <Chip size="small" color={getChipColor(params.row.status)} label={params.row.status}/>),
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', flex: 1,
            getActions: (params) => [
                <Tooltip title="View Application" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={params.row.status === VisitorApplicationStatus.PENDING ? <Grading/> : <Info/>}
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
                       const applications = await fetchVisitorApplications(pagination, sortModel, filter);
                       return {
                           data: applications[1],
                           rowCount: applications[0],
                       };
                   }}/>
    );
}