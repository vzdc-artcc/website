'use client';

import React, {useEffect, useState} from "react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useMyDiscordLink, useStartDiscordLink, useUnlinkDiscord} from "@/lib/osmium/hooks/discord-link";

// `discord_error` values from osmium's GET /api/v1/me/discord/link/callback redirect. The callback
// also forwards Discord's own OAuth `error` unchanged, which is where `access_denied` comes from.
const DISCORD_LINK_ERROR_MESSAGES = new Map<string, string>([
    ["session_mismatch", "Discord wasn't linked. Finish linking in the same browser where you're signed in to your own account (not while impersonating), then try again."],
    ["already_linked", "That Discord account is already linked to another vZDC account. Unlink it there, or authorize with a different Discord account."],
    ["expired", "The Discord link request expired. Click Link Discord to try again."],
    ["invalid_state", "That Discord link request wasn't recognized or was already used. Click Link Discord to try again."],
    ["missing_state", "That Discord link request wasn't recognized or was already used. Click Link Discord to try again."],
    ["missing_code", "Discord didn't finish the authorization. Click Link Discord to try again."],
    ["link_failed", "We couldn't confirm your account with Discord. Try again in a few minutes."],
    ["server_error", "Something went wrong on our end while linking Discord. Try again later, and contact staff if it keeps happening."],
]);

const DISCORD_LINK_GENERIC_ERROR = "Discord linking failed. Try again, and contact staff if it keeps happening.";

function discordLinkErrorMessage(code: string): string {
    return DISCORD_LINK_ERROR_MESSAGES.get(code) ?? DISCORD_LINK_GENERIC_ERROR;
}

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
        } else if (errParam === "access_denied") {
            toast.info("Discord linking was cancelled.");
            params.delete("discord_error");
        } else if (errParam) {
            toast.error(discordLinkErrorMessage(errParam));
            params.delete("discord_error");
        } else {
            return;
        }
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
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
            const result = await startLink.mutateAsync(`${window.location.origin}/profile/overview`);
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
