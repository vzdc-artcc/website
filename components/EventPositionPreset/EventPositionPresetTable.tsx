'use client';
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {EventPositionPresetDeleteButton} from "./EventPositionPresetDeleteButton";
import {Box, Tooltip} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {useEventPositionPresets} from "@/lib/osmium/hooks/events";

export function EventPositionPresetTable() {

    const router = useRouter();
    const {data, isLoading} = useEventPositionPresets();
    const rows = data?.items ?? [];

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
        },
        {
            field: 'positions',
            headerName: 'Positions',
            flex: 2,
            renderCell: (params) => {
                const positions: string[] = params.row.positions;
                if (positions.length <= 4) {
                    return positions.join(', ');
                }
                const firstFour = positions.slice(0, 4).join(', ');
                return `${firstFour}, ${positions.length - 4} more`;
            },
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
                <EventPositionPresetDeleteButton key={`deletebtn-${params.row.id}`} positionPreset={params.row}/>,
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
                    sorting: {sortModel: [{field: 'name', sort: 'asc'}]},
                    pagination: {paginationModel: {pageSize: 10}},
                }}
                pageSizeOptions={[5, 10, 20]}
                autoHeight
            />
        </Box>
    );
}
