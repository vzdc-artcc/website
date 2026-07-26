'use client';
import React, {useEffect, useRef} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import {CircularProgress, Stack, Typography} from "@mui/material";
import {useCompleteDiscordLink} from "@/lib/osmium/hooks/discord-link";

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const completeLink = useCompleteDiscordLink();
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            router.replace(`/profile/overview?discord_error=${encodeURIComponent(error)}`);
            return;
        }
        if (!code || !state) {
            router.replace('/profile/overview?discord_error=missing_params');
            return;
        }

        completeLink.mutate(
            {code, state, redirectUri: `${window.location.origin}/api/discord/callback`},
            {
                onSuccess: (data) => {
                    const username = data?.external_id ?? '';
                    router.replace(`/profile/overview?discord_linked=1&discord_username=${encodeURIComponent(username)}`);
                },
                onError: () => {
                    router.replace('/profile/overview?discord_error=link_failed');
                },
            },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack direction="column" spacing={2} alignItems="center" sx={{mt: 4,}}>
            <CircularProgress/>
            <Typography>Linking your Discord account…</Typography>
        </Stack>
    );
}
