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

// Role "Name" values are prefix-matched by the bot (resolve_role_prefix), so any
// `impromptu_*` / `break_board_*` suffix works. These are the concrete roles this
// facility uses, offered as suggestions; the field stays free-text so operators
// can add their own. For break board, the button label is derived from the suffix
// (e.g. `break_board_unrestricted_twr` -> "Unrestricted TWR").
export const KNOWN_DISCORD_ROLE_NAMES: readonly string[] = [
    // Impromptu training — one role per session type (ground/tower/approach/center),
    // pinged when a session of that type is offered.
    'impromptu_ground',
    'impromptu_tower',
    'impromptu_approach',
    'impromptu_center',
    // Break board — each role becomes a position button on the break board.
    'break_board_tier_1_gnd',
    'break_board_tier_1_twr',
    'break_board_unrestricted_gnd',
    'break_board_unrestricted_twr',
    'break_board_unrestricted_app',
    'break_board_center',
    'break_board_pct',
];
