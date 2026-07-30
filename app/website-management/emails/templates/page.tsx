'use client';
import React from 'react';
import {
    Alert,
    Card,
    CardContent,
    Chip,
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
import {useEmailTemplates} from "@/lib/osmium/hooks/emails";

export default function Page() {
    const {data: templates, isLoading, isError} = useEmailTemplates();

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" fontWeight={700}>Email Templates</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>The transactional email templates osmium can send.</Typography>
                {isLoading && <CircularProgress/>}
                {isError && <Alert severity="error">Failed to load templates.</Alert>}
                {templates && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {templates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell sx={{fontFamily: 'monospace',}}>{template.id}</TableCell>
                                        <TableCell>{template.name}</TableCell>
                                        <TableCell>{template.category}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Chip size="small"
                                                      label={template.is_transactional ? 'Transactional' : 'Marketing'}
                                                      color={template.is_transactional ? 'info' : 'default'}/>
                                                {template.allow_arbitrary_addresses &&
                                                    <Chip size="small" label="Arbitrary addresses"/>}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{template.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    );
}
