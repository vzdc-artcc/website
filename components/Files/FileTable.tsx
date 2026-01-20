import React from 'react';
import {File} from '@prisma/client';
import {IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Link from "next/link";
import {Edit, OpenInNew} from "@mui/icons-material";
import FileDeleteButton from "@/components/Files/FileDeleteButton";

export default async function FileTable({files, admin, openInNewTab = true,}: {
    files: File[],
    admin?: boolean,
    openInNewTab?: boolean,
}) {

    return (
        <TableContainer sx={{}}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        {admin && <TableCell>Alias</TableCell>}
                        <TableCell>Description</TableCell>
                        <TableCell>Updated At (UTC)</TableCell>
                        {admin && <TableCell>Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell>
                                <Link href={`/publications/${file.id}`} target={openInNewTab ? '_blank' : '_self'}
                                      style={{color: file.highlightColor || 'inherit', textDecoration: 'none'}}>
                                    <Stack direction="row" alignItems="center">
                                        {file.name}
                                        {openInNewTab && <OpenInNew fontSize="small"/>}
                                    </Stack>
                                </Link>
                            </TableCell>
                            {admin && <TableCell>{file.alias}</TableCell>}
                            <TableCell>{file.description}</TableCell>
                            <TableCell>{file.updatedAt.toUTCString()}</TableCell>
                            {admin && <TableCell>
                                <Link href={`/admin/files/${file.categoryId}/${file.id}`}
                                      style={{color: file.highlightColor || 'inherit',}}>
                                    <IconButton>
                                        <Edit/>
                                    </IconButton>
                                </Link>
                                <FileDeleteButton file={file}/>
                            </TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}