'use client';
import React from 'react';
import {useDiscordGuildDiscovery} from "@/lib/osmium/hooks/discord";
import type {DiscordResourceOption} from "@/components/Discord/DiscordResourceSelect";

type ResourceKind = 'channel' | 'role' | 'category';

const NOUNS: Record<ResourceKind, string> = {
    channel: 'channels',
    role: 'roles',
    category: 'categories',
};

/**
 * Shared wiring for the Discord channel/role/category pickers: runs guild
 * discovery, maps the relevant slice to {id, label} options, and builds the
 * three-branch helper text. Centralizing this keeps the offline-fallback copy
 * and the option-mapping identical across DiscordChannelForm / DiscordRoleForm /
 * DiscordCategoryForm instead of being copy-pasted in each.
 *
 * The option array is memoized on the discovery payload so its identity is
 * stable across unrelated re-renders (keystrokes elsewhere in the form), which
 * keeps the label-upgrade effect in DiscordResourceSelect from firing needlessly.
 */
export function useGuildResourceOptions(kind: ResourceKind, guildId: string | null | undefined): {
    options: DiscordResourceOption[];
    loading: boolean;
    helperText: string;
} {
    const {data: discovery, isLoading, isError} = useDiscordGuildDiscovery(guildId);

    const options = React.useMemo<DiscordResourceOption[]>(() => {
        switch (kind) {
            case 'channel':
                return (discovery?.channels ?? []).map((c) => ({
                    id: c.id,
                    label: `#${c.name}${c.kind && c.kind !== 'text' ? ` (${c.kind})` : ''}`,
                }));
            case 'role':
                return (discovery?.roles ?? []).map((r) => ({id: r.id, label: `@${r.name}`}));
            case 'category':
                return (discovery?.categories ?? []).map((c) => ({id: c.id, label: c.name}));
        }
    }, [kind, discovery]);

    const noun = NOUNS[kind];
    const helperText = !guildId
        ? `Set a Guild on this config first to load ${noun}.`
        : isError
            ? `Couldn't reach the Discord bot — enter a ${kind} ID manually.`
            : `Pick a ${kind}, or type an ID.`;

    return {options, loading: isLoading, helperText};
}
