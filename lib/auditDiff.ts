export interface FieldChange {
    path: string;
    before: unknown;
    after: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Flattens nested objects to dot paths; arrays and scalars are leaves. A snapshot
 * that is itself an array or scalar becomes a single "(value)" leaf.
 */
function flatten(value: unknown, prefix = '', out: Map<string, unknown> = new Map()): Map<string, unknown> {
    if (isPlainObject(value)) {
        for (const [key, child] of Object.entries(value)) {
            flatten(child, prefix ? `${prefix}.${key}` : key, out);
        }
    } else if (prefix) {
        out.set(prefix, value);
    } else if (value !== null && value !== undefined) {
        out.set('(value)', value);
    }
    return out;
}

/**
 * The fields that differ between an audit row's before and after snapshots,
 * sorted by path. A missing snapshot (CREATE/DELETE) reports every field of the
 * other side; a field absent on one side is reported as undefined there.
 */
export function diffSnapshots(before: unknown, after: unknown): FieldChange[] {
    const left = flatten(before);
    const right = flatten(after);
    const paths = new Set([...left.keys(), ...right.keys()]);
    return [...paths]
        .filter((path) => JSON.stringify(left.get(path)) !== JSON.stringify(right.get(path)))
        .sort()
        .map((path) => ({path, before: left.get(path), after: right.get(path)}));
}
