'use client';
import React from 'react';
import {Alert} from "@mui/material";
import {Turnstile} from "@marsidev/react-turnstile";

// Inlined at build time; an unset key would otherwise render an empty widget
// that can never produce a token.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

export const captchaConfigured = SITE_KEY !== '';

/**
 * Cloudflare Turnstile for public forms. When the site key is missing it says
 * so, instead of rendering a widget that silently blocks submission.
 */
export default function CaptchaField({onToken}: { onToken: (token: string) => void }) {
    if (!captchaConfigured) {
        return (
            <Alert severity="error">
                The captcha isn&apos;t configured on this site, so this form can&apos;t be submitted right now.
                Please contact the webmaster.
            </Alert>
        );
    }

    return (
        <Turnstile
            siteKey={SITE_KEY}
            onSuccess={onToken}
            onExpire={() => onToken('')}
            onError={() => onToken('')}
        />
    );
}
