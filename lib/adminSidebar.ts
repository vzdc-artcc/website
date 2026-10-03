export const ADMIN_SIDEBAR_WIDTH = '300px';
export const ADMIN_SIDEBAR_SHRINK_CUTOFF = 'xl';

export const permanentSidebarResponsive = <T>(inactiveValue: T | 0, activeValue: T | 0) => {
    return {
        xs: inactiveValue,
        [ADMIN_SIDEBAR_SHRINK_CUTOFF]: activeValue,
    }
}