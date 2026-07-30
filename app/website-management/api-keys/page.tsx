'use client';
import React from 'react';
import {
    Alert,
    Button,
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
import {Add} from "@mui/icons-material";
import Link from "next/link";
import {useApiKeys} from "@/lib/osmium/hooks/api-keys";
import {getTimeAgo} from "@/lib/date";

export default function Page() {
    const {data, isLoading, isError} = useApiKeys();

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight={700}>API Keys</Typography>
                        <Typography variant="body2" color="text.secondary">Service-account keys for programmatic access to osmium.</Typography>
                        <Link href="/website-management/api-keys/new" style={{textDecoration: 'none',}}>
                            <Button variant="contained" startIcon={<Add/>}>New API Key</Button>
                        </Link>
                    </Stack>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {isLoading && <CircularProgress/>}
                    {isError && <Alert severity="error">Failed to load API keys.</Alert>}
                    {data && data.items.length === 0 && <Typography>No API keys yet.</Typography>}
                    {data && data.items.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Key</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Created By</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell>Last Used</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.items.map((item) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>
                                                <Link href={`/website-management/api-keys/${item.id}`}
                                                      style={{color: 'inherit',}}>
                                                    {item.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{item.prefix ? `${item.prefix}…${item.last_four}` : '—'}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={item.status}
                                                      color={item.status === 'active' ? 'success' : 'default'}/>
                                            </TableCell>
                                            <TableCell>{item.created_by_display_name || '—'}</TableCell>
                                            <TableCell>{getTimeAgo(new Date(item.created_at))}</TableCell>
                                            <TableCell>{item.last_used_at ? getTimeAgo(new Date(item.last_used_at)) : 'Never'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
