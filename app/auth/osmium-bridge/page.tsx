"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { CircularProgress, Container, Stack, Typography } from "@mui/material";

/**
 * Transitional step in the login chain: osmium's VATSIM OAuth redirects here
 * once it has set osmium_session, and this page immediately continues into
 * NextAuth's own VATSIM sign-in so the browser ends up with both sessions.
 * Remove once NextAuth is fully retired (end of the osmium migration) and
 * osmium's login becomes the only auth step.
 */
function OsmiumBridgeContent() {
    const searchParams = useSearchParams();
    const dest = searchParams.get("dest") || "/";

    useEffect(() => {
        signIn("vatsim", { callbackUrl: dest }).then();
    }, [dest]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
            <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography>Signing in...</Typography>
            </Stack>
        </Container>
    );
}

export default function OsmiumBridgePage() {
    return (
        <Suspense>
            <OsmiumBridgeContent />
        </Suspense>
    );
}
