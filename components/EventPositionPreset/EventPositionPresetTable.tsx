'use client';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "../DataTable/DataTable";
import {fetchEventPresets} from "@/actions/eventPreset";
import {EventPositionPreset} from "@/generated/prisma/browser";
import {EventPositionPresetDeleteButton} from "./EventPositionPresetDeleteButton";
import {Tooltip} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useRouter} from "next/navigation";

export function EventPositionPresetTable() {
    
    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'name', 
            headerName: 'Name', 
            flex: 1, 
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator]
        },
        {
            field: 'positions', 
            headerName: 'Positions',
            flex: 2, 
            renderCell: (params) => {
                const positions = params.row.positions;
                if (positions.length <= 4) {
                    return positions.join(', ');
                }
                const firstFour = positions.slice(0, 4).join(', ');
                return `${firstFour}, ${positions.length - 4} more`;
            },            
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator]
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 1,
            getActions: (params) => [
                <Tooltip title="Edit Event Position Preset" key={`edit-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Edit/>}
                        label="Edit Event Position Preset"
                        onClick={() => router.push(`/events/admin/event-presets/${params.row.id}`)}
                    />
                </Tooltip>,
                <EventPositionPresetDeleteButton key={`deletebtn-${params.row.id}`} positionPreset={params.row as EventPositionPreset} />,
            ],
        }
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'name', sort: 'asc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       const eventPresets = await fetchEventPresets(pagination, sortModel, filter);
                       return {
                           data: eventPresets[1],
                           rowCount: eventPresets[0],
                       };
                   }}/>
    );
}