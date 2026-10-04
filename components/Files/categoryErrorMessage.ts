/**
 * A toast message for a failed file-category write, from osmium's error code.
 * `bad_request` covers a duplicate or invalid key; a refusal means the user lacks
 * the category (or, for a delete with files, the file) permission.
 */
export function categoryErrorMessage(error: unknown, fallback: string, badRequest = fallback): string {
    const code = (error as { error?: string } | undefined)?.error;
    if (code === 'forbidden' || code === 'unauthorized') {
        return "You don't have permission to do that with file categories.";
    }
    if (code === 'bad_request') return badRequest;
    return fallback;
}
