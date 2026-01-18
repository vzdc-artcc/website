import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Tooltip, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Accordion, AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import prisma from "@/lib/db";
import DiscordConfigForm from "@/components/DiscordConfig/DiscordConfigForm";
import Link from "next/link";
import {Add, Edit, ExpandMore} from "@mui/icons-material";
import ChannelDeleteButton from "@/components/DiscordConfig/ChannelDeleteButton";
import DiscordConfigDeleteButton from "@/components/DiscordConfig/DiscordConfigDeleteButton";
import RoleDeleteButton from "@/components/DiscordConfig/RoleDeleteButton";
import CategoryDeleteButton from "@/components/DiscordConfig/CategoryDeleteButton";

export default async function Page() {
    const configs = await prisma.discordConfig.findMany({
        orderBy: { guildId: "asc" },
        include: { channels: true, roles: true, categories: true },
    });

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

            {configs.map((config) => (
                <Card key={config.id}>
                    <CardContent>
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="space-between"
                               sx={{mb: 1,}}>
                            <Typography variant="h6">{config.name}</Typography>
                            <Box>
                                <Tooltip title="Edit Config">
                                    <Link href={`/web-system/discord-configs/discord-config/${config.id}`} style={{color: 'inherit',}}>
                                        <IconButton>
                                            <Edit/>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                                <DiscordConfigDeleteButton discordConfig={config}/>
                            </Box>
                        </Stack>
                        <Accordion>
                            <AccordionSummary id="panel-header" aria-controls="panel-content" expandIcon={<ExpandMore />}>
                                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center"
                                       sx={{mb: 1,}}>
                                    <Typography variant="h6">Channels</Typography>
                                    <Tooltip title="Add Channel">
                                        <Link href={`/web-system/discord-configs/channel/new?discordConfigId=${config.id}`}
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
                                            {config.channels.map((channel) => (
                                                <TableRow key={channel.id}>
                                                    <TableCell>{channel.name}</TableCell>
                                                    <TableCell>{channel.channelId}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Edit">
                                                            <Link href={`/web-system/discord-configs/channel/${channel.id}`}
                                                                  style={{color: 'inherit',}}>
                                                                <IconButton>
                                                                    <Edit/>
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                        <ChannelDeleteButton channel={channel}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary id="panel-header" aria-controls="panel-content" expandIcon={<ExpandMore />}>
                                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center"
                                       sx={{mb: 1,}}>
                                    <Typography variant="h6">Roles</Typography>
                                    <Tooltip title="Add Role">
                                        <Link href={`/web-system/discord-configs/role/new?discordConfigId=${config.id}`}
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
                                            {config.roles.map((role) => (
                                                <TableRow key={role.id}>
                                                    <TableCell>{role.name}</TableCell>
                                                    <TableCell>{role.roleId}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Edit">
                                                            <Link href={`/web-system/discord-configs/role/${role.id}`}
                                                                  style={{color: 'inherit',}}>
                                                                <IconButton>
                                                                    <Edit/>
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                        <RoleDeleteButton role={role}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary id="panel-header" aria-controls="panel-content" expandIcon={<ExpandMore />}>
                                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center"
                                       sx={{mb: 1,}}>
                                    <Typography variant="h6">Categories</Typography>
                                    <Tooltip title="Add Category">
                                        <Link href={`/web-system/discord-configs/category/new?discordConfigId=${config.id}`}
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
                                            {config.categories.map((category) => (
                                                <TableRow key={category.id}>
                                                    <TableCell>{category.name}</TableCell>
                                                    <TableCell>{category.categoryId}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Edit">
                                                            <Link href={`/web-system/discord-configs/category/${category.id}`}
                                                                  style={{color: 'inherit',}}>
                                                                <IconButton>
                                                                    <Edit/>
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                        <CategoryDeleteButton category={category}/>
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
