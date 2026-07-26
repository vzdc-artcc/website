'use client';

import {Checklist, Edit, OpenInNew} from "@mui/icons-material";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import Link from "next/link";
import EventDeleteButton from "./EventDeleteButton";
import {Box, Tooltip} from "@mui/material";
import {useRouter} from "next/navigation";
import {formatZuluDate} from "@/lib/date";
import {useEvents} from "@/lib/osmium/hooks/events";
import {osmiumBaseUrl} from "@/lib/osmium/client";

export default function EventTable({archived}: { archived?: boolean, }) {

    const router = useRouter();
    const {data, isLoading} = useEvents({pageSize: 200});
    const rows = (data?.items ?? []).filter((e) => !!e.archived_at === !!archived);

    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'Name',
            flex: 3,
        },
        {
            field: 'event_type',
            headerName: 'Type',
            flex: 1,
        },
        {
            field: 'starts_at',
            headerName: 'Start (GMT)',
            valueFormatter: (value) => formatZuluDate(new Date(value)),
            flex: 2,
        },
        {
            field: 'ends_at',
            headerName: 'End (GMT)',
            valueFormatter: (value) => formatZuluDate(new Date(value)),
            flex: 2,
        },
        {
            field: 'banner_asset_id',
            type: 'actions',
            headerName: 'Banner',
            flex: 1,
            renderCell: (params) => {
                return params.row.banner_asset_id ?
                    <Link href={`${osmiumBaseUrl}/cdn/${params.row.banner_asset_id}`} target="_blank" style={{color: 'inherit',}}><OpenInNew/></Link> : 'N/A';
            },
        },
        {
            field: 'hidden',
            type: 'boolean',
            headerName: 'Hidden',
            flex: 1,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 2,
            getActions: (params) => [
                <Tooltip title="Event Manager" key={`positions-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Checklist/>}
                        label="Event Manager"
                        onClick={() => router.push(`/events/admin/events/${params.row.id}/manager`)}
                    />
                </Tooltip>,
                <Tooltip title="Edit Event" key={`edit-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Edit/>}
                        label="Edit Event"
                        onClick={() => router.push(`/events/admin/events/${params.row.id}`)}
                    />
                </Tooltip>,
                <EventDeleteButton key={`deletebtn-${params.row.id}`} event={params.row}/>,
            ],
        }
    ];

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%'}}>
            <DataGrid
                loading={isLoading}
                columns={columns}
                rows={rows}
                initialState={{
                    sorting: {
                        sortModel: [archived ? {field: 'ends_at', sort: 'desc'} : {field: 'starts_at', sort: 'asc'}],
                    },
                    pagination: {paginationModel: {pageSize: 10}},
                }}
                pageSizeOptions={[5, 10, 20]}
                autoHeight
            />
        </Box>
    )
}
