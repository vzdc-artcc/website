// Logical config "Name" keys the Discord bot recognizes. These are suggestions
// for the config UI — the fields stay free-text so operators can add their own.
//
// Source of truth: the bot's `resolve_named_channels(...)` call sites in
// discord-bot/src/models/discord.rs, plus IMPROMPTU_SELECTOR_CHANNEL_NAME /
// BREAK_BOARD_CHANNEL_NAME in services/discord.rs.
export const KNOWN_DISCORD_CHANNEL_NAMES: readonly string[] = [
    'announcements',
    'audit_log',
    'break_board',
    'event_announcements',
    'event_position_posting',
    'impromptu_training',
    'staffup',
];

// Role "Name" values are prefix-matched by the bot (resolve_role_prefix), so the
// suffix is arbitrary (e.g. `impromptu_s1`). These prefixes are offered as
// starting points; operators complete them or type a full custom name.
export const KNOWN_DISCORD_ROLE_NAME_PREFIXES: readonly string[] = [
    'impromptu_',
    'break_board_',
];
