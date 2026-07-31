// Single source of truth for classifying osmium audit rows
// (access.audit_logs.resource_type) into the four viewing contexts. `scope_type`
// is not a reliable domain key on the backend (facility rows all land under
// `global`), so `resource_type` is the classifier.
//
// Section rule: Training admin sees only `training`, Events management only
// `events`, Facility only `facility`, and Website Management sees everything
// (`all` → no filter). Resource types in NONE of the scoped sets (system/site
// activity like PUBLICATION, FILE, API_KEY, INCIDENT, FEEDBACK, EMAIL_BRANDING,
// CHANGE_BROADCAST, DATA_EXPORT, WELCOME_MESSAGES, STATISTICS_PREFIXES,
// NOTIFICATION_ANNOUNCEMENT, AUTH_IMPERSONATION, USER_SESSION, ATC_BOOKING)
// surface only in Website Management's `all` view by design.

export type AuditDomain = 'training' | 'events' | 'facility' | 'all';

// Resource types that legitimately belong to more than one domain view. Declared
// once and spread into each owning array so the views stay in sync by
// construction (adding a new cert type here surfaces it in every view that uses it).
const CERT_TYPES = ["CERTIFICATION_TYPE", "CERTIFICATION", "SOLO_CERTIFICATION"];
const STAFFING_TYPES = ["STAFFING_REQUEST"];

export const AUDIT_DOMAIN_RESOURCE_TYPES: Record<Exclude<AuditDomain, 'all'>, string[]> = {
    training: [
        "TRAINING_SESSION",
        "TRAINING_APPOINTMENT",
        "TRAINING_ASSIGNMENT",
        "TRAINING_ASSIGNMENT_REQUEST",
        "TRAINING_ASSIGNMENT_REQUEST_INTEREST",
        "TRAINER_RELEASE_REQUEST",
        "OTS_RECOMMENDATION",
        "LESSON",
        "LESSON_RUBRIC_CRITERIA",
        "LESSON_RUBRIC_CELL",
        "TRAINING_PROGRESSION",
        "TRAINING_PROGRESSION_STEP",
        "TRAINING_PROGRESSION_ASSIGNMENT",
        "PERFORMANCE_INDICATOR_TEMPLATE",
        "PERFORMANCE_INDICATOR_CATEGORY",
        "PERFORMANCE_INDICATOR_CRITERIA",
        "DOSSIER_ENTRY",
        // Also classified under `facility`; the training views surface cert/solo grants too.
        ...CERT_TYPES,
    ],
    events: [
        "EVENT",
        "EVENT_POSITION",
        "EVENT_POSITION_BATCH",
        "EVENT_OPS_PLAN",
        "OPS_PLAN_FILE",
        "EVENT_TMI",
        "EVENT_PRESET",
        "EVENT_PRESET_POSITIONS",
        "EVENT_POSITION_LOCK",
        "EVENT_DISCORD_PUBLISH",
        "EVENT_DISCORD_SCHEDULED_EVENT",
        // Also classified under `facility`; event managers see staffing requests here too.
        ...STAFFING_TYPES,
    ],
    facility: [
        "LOA",
        ...CERT_TYPES,
        ...STAFFING_TYPES,
        "SUA_REQUEST",
        "USER_CONTROLLER_LIFECYCLE",
        "USER_PROFILE",
        "USER_ACCESS",
        "USER_FLAGS",
        "USER_CONTROLLER_STATUS",
        "USER_OPERATING_INITIALS",
        "USER_STAFF_POSITION",
        "USER_VATUSA_REFRESH",
        "VISITOR_APPLICATION",
        "VISITOR_MEMBERSHIP",
        "JOB",
    ],
};

/**
 * Resource-type allow-list for a domain, or `undefined` for `all` (Website
 * Management) so no filter is applied and every row is shown.
 */
export function domainResourceTypes(domain: AuditDomain): string[] | undefined {
    return domain === 'all' ? undefined : AUDIT_DOMAIN_RESOURCE_TYPES[domain];
}
