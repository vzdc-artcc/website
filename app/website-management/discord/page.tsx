'use client';
import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import {Add, Edit, ExpandMore} from "@mui/icons-material";
import Link from "next/link";
import {useDiscordBundle} from "@/lib/osmium/hooks/discord";
import DiscordConfigForm from "@/components/Discord/DiscordConfigForm";
import DiscordConfigDeleteButton from "@/components/Discord/DiscordConfigDeleteButton";
import DiscordChannelDeleteButton from "@/components/Discord/DiscordChannelDeleteButton";
import DiscordRoleDeleteButton from "@/components/Discord/DiscordRoleDeleteButton";
import DiscordCategoryDeleteButton from "@/components/Discord/DiscordCategoryDeleteButton";

export default function Page() {
    const {data: bundle, isLoading, isError} = useDiscordBundle();

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Discord Configs</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2,}}>New Config</Typography>
                    <DiscordConfigForm/>
                </CardContent>
            </Card>

            {isLoading && <CircularProgress/>}
            {isError && <Alert severity="error">Failed to load Discord configs.</Alert>}

            {bundle?.configs.map((config) => (
                <Card key={config.id}>
                    <CardContent>
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center"
                               sx={{mb: 1,}}>
                            <Typography variant="h6">{config.name}</Typography>
                            <Box>
                                <Tooltip title="Edit Config">
                                    <Link href={`/website-management/discord/config/${config.id}`}
                                          style={{color: 'inherit',}}>
                                        <IconButton>
                                            <Edit/>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                                <DiscordConfigDeleteButton config={config}/>
                            </Box>
                        </Stack>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Stack direction="row" spacing={2} justifyContent="space-between"
                                       alignItems="center" sx={{mb: 1, width: '100%',}}>
                                    <Typography variant="h6">Channels</Typography>
                                    <Tooltip title="Add Channel">
                                        <Link
                                            href={`/website-management/discord/channel/new?discordConfigId=${config.id}`}
                                            style={{color: 'inherit',}}>
                                            <IconButton>
                                                <Add/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Channel Name</TableCell>
                                                <TableCell>Channel ID</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bundle.channels.filter((c) => c.discord_config_id === config.id).map((channel) => (
                                                <TableRow key={channel.id}>
                                                    <TableCell>{channel.name}</TableCell>
                                                    <TableCell>{channel.channel_id}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Edit">
                                                            <Link
                                                                href={`/website-management/discord/channel/${channel.id}`}
                                                                style={{color: 'inherit',}}>
                                                                <IconButton>
                                                                    <Edit/>
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                        <DiscordChannelDeleteButton channel={channel}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Stack direction="row" spacing={2} justifyContent="space-between"
                                       alignItems="center" sx={{mb: 1, width: '100%',}}>
                                    <Typography variant="h6">Roles</Typography>
                                    <Tooltip title="Add Role">
                                        <Link
                                            href={`/website-management/discord/role/new?discordConfigId=${config.id}`}
                                            style={{color: 'inherit',}}>
                                            <IconButton>
                                                <Add/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Role Name</TableCell>
                                                <TableCell>Role ID</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bundle.roles.filter((r) => r.discord_config_id === config.id).map((role) => (
                                                <TableRow key={role.id}>
                                                    <TableCell>{role.name}</TableCell>
                                                    <TableCell>{role.role_id}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Edit">
                                                            <Link
                                                                href={`/website-management/discord/role/${role.id}`}
                                                                style={{color: 'inherit',}}>
                                                                <IconButton>
                                                                    <Edit/>
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                        <DiscordRoleDeleteButton role={role}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Stack direction="row" spacing={2} justifyContent="space-between"
                                       alignItems="center" sx={{mb: 1, width: '100%',}}>
                                    <Typography variant="h6">Categories</Typography>
                                    <Tooltip title="Add Category">
                                        <Link
                                            href={`/website-management/discord/category/new?discordConfigId=${config.id}`}
                                            style={{color: 'inherit',}}>
                                            <IconButton>
                                                <Add/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Category Name</TableCell>
                                                <TableCell>Category ID</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bundle.categories.filter((c) => c.discord_config_id === config.id).map((category) => (
                                                <TableRow key={category.id}>
                                                    <TableCell>{category.name}</TableCell>
                                                    <TableCell>{category.category_id}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Edit">
                                                            <Link
                                                                href={`/website-management/discord/category/${category.id}`}
                                                                style={{color: 'inherit',}}>
                                                                <IconButton>
                                                                    <Edit/>
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                        <DiscordCategoryDeleteButton category={category}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}
