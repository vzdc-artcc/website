/**
 * A toast message for a failed file-category write, from osmium's error code.
 * `bad_request` covers a duplicate or invalid key; a refusal means the user lacks
 * the category (or, for a delete with files, the file) permission.
 */
export function categoryErrorMessage(error: unknown, fallback: string, badRequest = fallback): string {
    const code = (error as { error?: string } | undefined)?.error;
    if (code === 'forbidden') return "You don't have permission to do that with file categories.";
    // osmium also answers a missing permission with 401 until it returns 403 for those.
    if (code === 'unauthorized') return 'Your session may have expired, or you lack permission for that.';
    if (code === 'bad_request') return badRequest;
    return fallback;
}
