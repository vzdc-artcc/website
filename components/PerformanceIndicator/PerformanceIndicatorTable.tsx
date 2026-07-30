'use client';
import React from 'react';
import {Box, Tooltip} from "@mui/material";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import PerformanceIndicatorDeleteButton from "@/components/PerformanceIndicator/PerformanceIndicatorDeleteButton";
import {Edit} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {usePerformanceIndicatorTemplates} from "@/lib/osmium/hooks/training";
import {useCoarseRoles} from "@/lib/osmium/coarseRoles";

export default function PerformanceIndicatorTable() {

    const router = useRouter();
    const {data, isLoading} = usePerformanceIndicatorTemplates();
    const rows = data?.items ?? [];
    const {isStaff} = useCoarseRoles();

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => isStaff ? [
                <Tooltip title="Edit Performance Indicator" key={`edit-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Edit/>}
                        label="Edit Performance Indicator"
                        onClick={() => router.push(`/training/indicators/${params.row.id}`)}
                    />
                </Tooltip>,
                <PerformanceIndicatorDeleteButton key={`delete-${params.row.id}`} performanceIndicator={params.row}/>,
            ] : [],
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
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );
}
