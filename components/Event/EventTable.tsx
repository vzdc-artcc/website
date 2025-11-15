'use client';

import {Checklist, Edit, OpenInNew} from "@mui/icons-material";
import {getGridSingleSelectOperators, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {EventType} from "@prisma/client";
import Link from "next/link";
import EventDeleteButton from "./EventDeleteButton";
import {Tooltip} from "@mui/material";
import {useRouter} from "next/navigation";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "../DataTable/DataTable";
import {fetchEvents} from "@/actions/event";
import {formatZuluDate} from "@/lib/date";
import EventPromotionalMessageSendButton from "@/components/Event/EventPromotionalMessageSendButton";

export default function EventTable({ archived }: { archived?: boolean, }) {

    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            flex: 3,
        },
        {
            field: 'type',
            type: 'singleSelect',
            headerName: 'Type',
            flex: 1,
            sortable: false,
            valueOptions: Object.keys(EventType).map((model) => ({value: model, label: model})),
            filterOperators: getGridSingleSelectOperators().filter((operator) => operator.value === 'is'),
        },
        {
            field: 'start',
            type: 'dateTime',
            headerName: 'Start (GMT)',
            valueFormatter: formatZuluDate,
            flex: 2,
            filterable: false,
        },
        {
            field: 'end',
            type: 'dateTime',
            headerName: 'End (GMT)',
            valueFormatter: formatZuluDate,
            flex: 2,
            filterable: false,
        },
        {
            field: 'bannerKey',
            type: 'actions',
            headerName: 'Banner',
            flex: 1,
            renderCell: (params) => {
                return params.row.bannerKey ? <Link href={`https://utfs.io/f/${params.row.bannerKey}`} target="_blank" style={{ color: 'inherit', }}><OpenInNew /></Link> : 'N/A';
            },
        },
        {
            field: 'hidden',
            type: 'boolean',
            headerName: 'Hidden',
            flex: 1,
            sortable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 2,
            getActions: (params) => [
                <Tooltip title="Event Manager" key={`positions-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Checklist />}
                        label="Event Manager"
                        onClick={() => router.push(`/events/admin/events/${params.row.id}/manager`)}
                    />
                </Tooltip>,
                <EventPromotionalMessageSendButton key={`${params.row.id}-promo`} event={params.row}/>,
                <Tooltip title="Edit Event" key={`edit-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Edit/>}
                        label="Edit Event"
                        onClick={() => router.push(`/events/admin/events/${params.row.id}`)}
                    />
                </Tooltip>,
                <EventDeleteButton key={`deletebtn-${params.row.id}`} event={params.row} />,
            ],
        }
    ];

    return (
        <DataTable columns={columns} initialSort={[archived ? { field: 'end', sort: 'desc', } : {field: 'start', sort: 'asc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       const events = await fetchEvents(pagination, sortModel, filter, archived);
                       return {
                           data: events[1],
                           rowCount: events[0],
                       };
                   }}/>
    )
}