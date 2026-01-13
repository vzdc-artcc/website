"use client";

import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DiscordLinkButton({
                                              linked,
                                              discordUid,
                                          }: {
    linked?: boolean;
    discordUid?: string | null;
}) {
    const [isLinked, setIsLinked] = useState<boolean>(!!(linked && discordUid));
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const linkedParam = params.get("discord_linked");
        const errParam = params.get("discord_error");
        const usernameParam = params.get("discord_username");

        if (linkedParam) {
            const msg = usernameParam ? `Discord linked as ${usernameParam}` : "Discord account linked.";
            toast.success(msg);
            setIsLinked(true);
            if (usernameParam) {
                // optionally show tag somewhere else in your UI; we only set linked state
            }
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
        setLoading(true);
        try {
            const res = await fetch("/api/discord/unlink", { method: "POST" });
            setLoading(false);
            setConfirmOpen(false);
            if (res.ok) {
                setIsLinked(false);
                toast.success("Discord account unlinked.");
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error("Failed to unlink: " + (data?.error ?? res.statusText));
            }
        } catch {
            setLoading(false);
            setConfirmOpen(false);
            toast.error("Network error while unlinking.");
        }
    };

    const handlePrimary = () => {
        if (isLinked) {
            openConfirm();
        } else {
            // full navigation required to start OAuth reliably
            window.location.href = "/api/discord/link";
        }
    };

    return (
        <>
            <Button
                variant={isLinked ? "outlined" : "contained"}
                color={isLinked ? "error" : "primary"}
                onClick={handlePrimary}
                disabled={loading}
            >
                {isLinked ? "Unlink" : "Link Discord"}
            </Button>

            <Dialog open={confirmOpen} onClose={closeConfirm}>
                <DialogTitle>Unlink Discord</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to unlink your Discord account? This will cause many vZDC Discord features to stop working.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={doUnlink}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                    >
                        Unlink
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}