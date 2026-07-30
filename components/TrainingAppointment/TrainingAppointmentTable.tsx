'use client';
import React from 'react';
import {Box, Chip} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import Link from "next/link";
import {formatTimezoneDate} from "@/lib/date";
import TrainingAppointmentDeleteButton from "@/components/TrainingAppointment/TrainingAppointmentDeleteButton";
import TrainingAppointmentInformationDialog
    from "@/components/TrainingAppointment/TrainingAppointmentInformationDialog";
import {useTrainingAppointments} from "@/lib/osmium/hooks/training";
import {useMe} from "@/lib/osmium/hooks/me";
import {useHasStaffPosition} from "@/lib/osmium/hooks/staff-positions";

export default function TrainingAppointmentTable() {

    const {data: me} = useMe();
    const timeZone = me?.profile.timezone ?? 'America/New_York';
    const {has: isTrainingStaff} = useHasStaffPosition(['TA', 'ATA']);
    const {data, isLoading} = useTrainingAppointments();
    const rows = data?.items ?? [];

    const columns: GridColDef[] = [
        {
            field: 'student_name',
            flex: 1,
            headerName: 'Student',
            renderCell: (params) => (
                <Link href={`/training/history/${params.row.student_cid}`} target="_blank"
                      style={{textDecoration: 'none',}}>
                    <Chip label={params.row.student_name} size="small"/>
                </Link>
            ),
            sortable: false,
        },
        {
            field: 'trainer_name',
            flex: 1,
            headerName: 'Trainer',
            renderCell: (params) => <Chip label={params.row.trainer_name} size="small"/>,
            sortable: false,
        },
        {
            field: 'start',
            flex: 1,
            headerName: 'Start',
            renderCell: (params) => formatTimezoneDate(new Date(params.row.start), timeZone),
        },
        {
            field: 'estimated_duration_minutes',
            flex: 1,
            headerName: 'Duration (mins)',
            renderCell: (params) => params.row.estimated_duration_minutes ?? 0,
        },
        {
            field: 'environment',
            flex: 1,
            headerName: 'Environment',
            renderCell: (params) => (
                <span style={{color: params.row.double_booking ? 'red' : 'inherit',}}>{params.row.environment}</span>
            ),
        },
        {
            field: 'lessons',
            flex: 1,
            headerName: 'Lesson(s)',
            sortable: false,
            renderCell: (params) => params.row.lessons.map((lesson: { id: string, identifier: string }) => (
                <Chip
                    key={lesson.id}
                    label={lesson.identifier}
                    size="small"
                    color="info"
                    style={{margin: '2px'}}
                />
            )),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <TrainingAppointmentInformationDialog timeZone={timeZone} trainingAppointment={params.row}
                                                      key={params.id}
                                                      isTrainingStaff={isTrainingStaff}/>,
                isTrainingStaff || String(me?.cid) === String(params.row.trainer_cid) ?
                    <TrainingAppointmentDeleteButton trainingAppointment={params.row} fromAdmin key={`delete-${params.id}`}/>
                    : <></>,
            ],
            flex: 1,
        },
    ];

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%'}}>
            <DataGrid
                loading={isLoading}
                columns={columns}
                rows={rows}
                initialState={{
                    sorting: {sortModel: [{field: 'start', sort: 'desc'}]},
                    pagination: {paginationModel: {pageSize: 25}},
                }}
                pageSizeOptions={[10, 25, 50]}
                autoHeight
            />
        </Box>
    );
}
