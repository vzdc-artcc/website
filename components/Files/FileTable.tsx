import React from 'react';
import {IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Link from "next/link";
import {Edit, OpenInNew} from "@mui/icons-material";
import FileDeleteButton from "@/components/Files/FileDeleteButton";
import {Publication} from "@/lib/osmium/hooks/publications";

export default function FileTable({files, admin, ids = true,}: {
    files: Publication[],
    admin?: boolean,
    ids?: boolean,
}) {

    return (
        <TableContainer sx={{}}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Updated At (UTC)</TableCell>
                        {admin && <TableCell>Status</TableCell>}
                        {admin && <TableCell>Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell>
                                <Link href={ids ? file.cdn_url : `/publications/${file.id}`}
                                      target={ids ? '_self' : '_blank'}
                                      style={{color: 'inherit', textDecoration: 'none'}}>
                                    <Stack direction="row" alignItems="center">
                                        {file.title}
                                        {!ids && <OpenInNew fontSize="small"/>}
                                    </Stack>
                                </Link>
                            </TableCell>
                            <TableCell>{file.description}</TableCell>
                            <TableCell>{new Date(file.updated_at).toUTCString()}</TableCell>
                            {admin && <TableCell>{file.status}</TableCell>}
                            {admin && <TableCell>
                                <Link href={`/admin/files/${file.category_id}/${file.id}`}
                                      style={{color: 'inherit',}}>
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
