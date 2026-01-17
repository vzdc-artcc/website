import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Tooltip, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import prisma from "@/lib/db";
import DiscordConfigForm from "@/components/DiscordConfig/DiscordConfigForm";
import Link from "next/link";
import {Add, Edit} from "@mui/icons-material";
import ChannelDeleteButton from "@/components/DiscordConfig/ChannelDeleteButton";
import DiscordConfigDeleteButton from "@/components/DiscordConfig/DiscordConfigDeleteButton";

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
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center"
                               sx={{mb: 1,}}>
                            <Typography variant="h6">{config.name}</Typography>
                            <Box>
                                <Tooltip title="Add Channel">
                                    <Link href={`/web-system/discord-configs/channel/new?discordConfigId=${config.id}`}
                                          style={{color: 'inherit',}}>
                                        <IconButton>
                                            <Add/>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
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
                        <TableContainer sx={{maxHeight: 500,}}>
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
                                            <TableCell>{channel.channelId}</TableCell>
                                            <TableCell>{channel.name}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit">
                                                    <Link href={`/web-system/discord-config/channel${channel.id}`}
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
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}
