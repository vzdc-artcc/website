'use client';

import React, {useEffect, useState} from "react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useMyDiscordLink, useStartDiscordLink, useUnlinkDiscord} from "@/lib/osmium/hooks/discord-link";

export default function DiscordLinkButton() {
    const {data: link, isLoading} = useMyDiscordLink();
    const startLink = useStartDiscordLink();
    const unlinkDiscord = useUnlinkDiscord();
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const linkedParam = params.get("discord_linked");
        const errParam = params.get("discord_error");
        const usernameParam = params.get("discord_username");

        if (linkedParam) {
            const msg = usernameParam ? `Discord linked as ${usernameParam}` : "Discord account linked.";
            toast.success(msg);
            params.delete("discord_linked");
            params.delete("discord_username");
        } else if (errParam) {
            toast.error(`Discord link failed: ${errParam}`);
            params.delete("discord_error");
        } else {
            return;
        }
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openConfirm = () => setConfirmOpen(true);
    const closeConfirm = () => setConfirmOpen(false);

    const doUnlink = async () => {
        try {
            await unlinkDiscord.mutateAsync();
            setConfirmOpen(false);
            toast.success("Discord account unlinked.");
        } catch {
            setConfirmOpen(false);
            toast.error("Failed to unlink Discord account.");
        }
    };

    const handlePrimary = async () => {
        if (link?.linked) {
            openConfirm();
            return;
        }
        try {
            const result = await startLink.mutateAsync(`${window.location.origin}/api/discord/callback`);
            if (result?.auth_url) {
                window.location.href = result.auth_url;
            } else {
                toast.error("Discord linking isn't configured on the server yet.");
            }
        } catch {
            toast.error("Failed to start Discord linking.");
        }
    };

    const loading = isLoading || startLink.isPending || unlinkDiscord.isPending;
    const isLinked = !!link?.linked;

    return (
        <>
            <Button
                variant={isLinked ? "outlined" : "contained"}
                color={isLinked ? "error" : "primary"}
                onClick={handlePrimary}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16}/> : null}
            >
                {isLinked ? "Unlink" : "Link Discord"}
            </Button>

            <Dialog open={confirmOpen} onClose={closeConfirm}>
                <DialogTitle>Unlink Discord</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to unlink your Discord account? This will cause many vZDC Discord
                        features to stop working.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm} disabled={unlinkDiscord.isPending}>Cancel</Button>
                    <Button
                        onClick={doUnlink}
                        color="error"
                        variant="contained"
                        disabled={unlinkDiscord.isPending}
                        startIcon={unlinkDiscord.isPending ? <CircularProgress size={16}/> : null}
                    >
                        Unlink
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
