'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {Chip, IconButton} from "@mui/material";
import Link from "next/link";
import {Edit, Visibility} from "@mui/icons-material";
import TrainingSessionDeleteButton from "@/components/TrainingSession/TrainingSessionDeleteButton";
import {formatZuluDate, getDuration} from "@/lib/date";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {useRouter} from "next/navigation";
import {osmium} from "@/lib/osmium/client";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import {useMe} from "@/lib/osmium/hooks/me";
import {useCoarseRoles} from "@/lib/osmium/coarseRoles";

interface TrainingSessionRow {
    id: string;
    student_id: string;
    student_cid: number;
    student_name: string;
    instructor_id: string;
    instructor_cid: number;
    instructor_name: string;
    start: string;
    end: string;
    tickets: { id: string, lesson_id: string, lesson_identifier: string, passed: boolean }[];
}

export default function TrainingSessionTable({admin, studentCid, selfView}: {
    admin?: boolean,
    studentCid?: string,
    selfView?: boolean,
}) {

    const router = useRouter();
    // Identity/role from osmium (Phase 6). isInstructor folds STAFF, matching
    // the legacy `INSTRUCTOR || STAFF` these callers used. `selfView` scopes
    // the table to the current user's own sessions (the /profile view).
    const {data: me} = useMe();
    const {isInstructor} = useCoarseRoles();
    const effectiveStudentCid = selfView ? (me ? String(me.cid) : undefined) : studentCid;
    const {data: scopedStudent, isLoading: scopedStudentLoading} = useUserByCid(effectiveStudentCid ? Number(effectiveStudentCid) : undefined);
    const scopedStudentId = scopedStudent?.full?.profile.id;

    const columns: GridColDef[] = [
        {
            field: 'student',
            flex: 1,
            headerName: 'Student',
            renderCell: (params) => {
                const row = params.row as TrainingSessionRow;
                return (
                    <Link href={`/training/history/${row.student_cid}`} target="_blank"
                                              style={{textDecoration: 'none',}}>
                        <Chip
                                key={row.student_id}
                                label={row.student_name || 'Unknown'}
                                size="small"
                            />
                    </Link>
                )
            },
            filterable: !effectiveStudentCid,
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'instructor',
            flex: 1,
            headerName: 'Trainer',
            renderCell: (params) => {
                const row = params.row as TrainingSessionRow;
                return (
                    <Chip
                        key={row.instructor_id}
                        label={row.instructor_name || 'Unknown'}
                        size="small"
                    />
                )
            },
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'start',
            flex: 1,
            headerName: 'Start',
            valueGetter: (value) => new Date(value),
            renderCell: (params) => formatZuluDate(new Date(params.row.start)),
            type: 'dateTime',
            filterable: false,
        },
        {
            field: 'end',
            flex: 1,
            headerName: 'End',
            valueGetter: (value) => new Date(value),
            renderCell: (params) => formatZuluDate(new Date(params.row.end)),
            type: 'dateTime',
            filterable: false,
        },
        {
            field: 'duration',
            flex: 1,
            headerName: 'Duration',
            renderCell: (params) => getDuration(new Date(params.row.start), new Date(params.row.end)),
            sortable: false,
            filterable: false,
        },
        {
            field: 'lessons',
            flex: 1,
            headerName: 'Lessons',
            sortable: false,
            renderCell: (params) => (params.row as TrainingSessionRow).tickets.map((ticket) => {
                const color = ticket.passed ? 'success' : 'error';
                return (
                    <Chip
                        key={ticket.id}
                        label={ticket.lesson_identifier}
                        size="small"
                        color={color}
                        style={{margin: '2px'}}
                    />
                );
            }),
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => {
                const row = params.row as TrainingSessionRow;
                const canManage = isInstructor || me?.cid === row.instructor_cid;
                return [
                    <GridActionsCellItem
                        key={row.id}
                        icon={<Visibility/>}
                        label="View Session"
                        onClick={() => router.push(admin ? `/training/sessions/${row.id}` : `/profile/training/${row.id}`)}
                    />,
                    canManage ?
                        <Link key={`edit-${row.id}`} href={`/training/sessions/${row.id}/edit`} passHref>
                            <IconButton size="small">
                                <Edit/>
                            </IconButton>
                        </Link> : <React.Fragment key={`edit-${row.id}`}/>,
                    canManage ?
                        <TrainingSessionDeleteButton key={`delete-${row.id}`} sessionId={row.id}/>
                        : <React.Fragment key={`delete-${row.id}`}/>,
                ];
            },
            flex: 1,
        }
    ];

    if (effectiveStudentCid && scopedStudentLoading) {
        return null;
    }

    return (
        <>
            <DataTable
                columns={columns}
                initialSort={[{field: 'start', sort: 'desc',}]}
                fetchData={async (pagination, sortModel, filter) => {
                    const {data, error} = await osmium.GET("/api/v1/training/sessions", {
                        params: {
                            query: {
                                page: pagination.page + 1,
                                page_size: pagination.pageSize,
                                student_id: scopedStudentId,
                                sort_field: sortModel[0]?.field,
                                sort_order: sortModel[0]?.sort ?? undefined,
                                filter_field: filter?.field,
                                filter_operator: filter?.operator,
                                filter_value: filter?.value?.toString(),
                            },
                        },
                    });
                    if (error || !data) throw error;
                    return {data: data.items as TrainingSessionRow[], rowCount: data.total};
                }}
            />
        </>

    );
}
