import type {components} from "@/lib/osmium/generated/schema";

/** The student's first and last name, as staff lists show it, else their display name. */
export function studentName(assignment: components["schemas"]["ProgressionAssignmentItem"]): string {
    const legal = `${assignment.first_name ?? ''} ${assignment.last_name ?? ''}`.trim();
    return legal || assignment.display_name || 'Unknown';
}
