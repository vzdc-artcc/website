'use client';
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import Link from "next/link";
import { Add } from "@mui/icons-material";
import { useOtsRecommendations } from "@/lib/osmium/hooks/training";
import { useUsersByRole } from "@/lib/osmium/hooks/users";
import { useHasStaffPosition } from "@/lib/osmium/hooks/staff-positions";
import InstructorDropdown from "./InstructorDropdown";
import OtsRecommendationDeleteButton from "./OtsRecommendationDeleteButton";

export default function OtsRecommendationsView() {

    const { has: canModify } = useHasStaffPosition(['TA', 'WM']);
    const { data: recommendations, isLoading } = useOtsRecommendations();
    const { data: instructorsData } = useUsersByRole('INS');

    const instructors = (instructorsData?.items ?? [])
        .filter((u) => !!u.full)
        .map((u) => ({ id: u.full!.id, cid: u.basic.cid, name: `${u.full!.first_name ?? ''} ${u.full!.last_name ?? ''} (${u.basic.cid})`.trim() }));

    if (isLoading) {
        return <CircularProgress />;
    }

    const items = recommendations?.items ?? [];

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h5">OTS Recommendations</Typography>
                    {canModify && <Link href="/training/ots/new">
                        <Button variant="contained" size="large" startIcon={<Add />}>New OTS Recommendation</Button>
                    </Link>}
                </Stack>
                {items.length === 0 && <Typography>No OTS recommendations found.</Typography>}
                {items.length > 0 &&
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Instructor</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((rec) => (
                                    <TableRow key={rec.id}>
                                        <TableCell>{rec.student_name} ({rec.student_cid})</TableCell>
                                        <TableCell>
                                            {canModify
                                                ? <InstructorDropdown recommendationId={rec.id} instructors={instructors} assignedInstructorId={rec.assigned_instructor_id} />
                                                : (rec.assigned_instructor_name ?? 'Unassigned')}
                                        </TableCell>
                                        <TableCell>{rec.notes}</TableCell>
                                        <TableCell>
                                            {canModify && <OtsRecommendationDeleteButton recommendationId={rec.id} />}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
            </CardContent>
        </Card>
    );
}
