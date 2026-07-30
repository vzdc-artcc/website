// Resource types recorded in osmium's audit log (audit.logs.resource_type)
// that belong to the Training / Events domains, used to scope the
// `/training/logs` and `/events/admin/logs` activity views. Distinct from
// the legacy Prisma `LogModel` enum in `lib/log.ts` — that one still backs
// `training/overview`'s "Recent Training Activity" widget until
// Certifications/Solo/Progression/Users/Files/Mail (the domains still
// writing to it) migrate too.
export const TRAINING_AUDIT_RESOURCE_TYPES = [
    "LESSON",
    "LESSON_RUBRIC_CELL",
    "LESSON_RUBRIC_CRITERIA",
    "OTS_RECOMMENDATION",
    "PERFORMANCE_INDICATOR_CATEGORY",
    "PERFORMANCE_INDICATOR_CRITERIA",
    "PERFORMANCE_INDICATOR_TEMPLATE",
    "TRAINER_RELEASE_REQUEST",
    "TRAINING_APPOINTMENT",
    "TRAINING_ASSIGNMENT",
    "TRAINING_ASSIGNMENT_REQUEST",
    "TRAINING_ASSIGNMENT_REQUEST_INTEREST",
    "TRAINING_PROGRESSION",
    "TRAINING_PROGRESSION_ASSIGNMENT",
    "TRAINING_PROGRESSION_STEP",
    "TRAINING_SESSION",
];

export const EVENTS_AUDIT_RESOURCE_TYPES = [
    "EVENT",
    "EVENT_POSITION",
    "EVENT_POSITION_BATCH",
    "EVENT_PRESET",
    "STAFFING_REQUEST",
];
