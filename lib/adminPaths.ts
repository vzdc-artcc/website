'use client';
export const ADMIN_PATH_PREFIXES = ['/admin', '/training', '/events/admin', '/web-system'];

export const isAdminPath = (pathname: string) => {
    return ADMIN_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix));
}