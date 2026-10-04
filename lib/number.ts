const HOURS_FORMAT = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/**
 * Hours for display: thousands-separated, two decimals (`1,234.57`). Never
 * `toPrecision`, which switches to exponent notation (`1.23e+3`) past three
 * significant digits.
 */
export function formatHours(value: number): string {
    return HOURS_FORMAT.format(value);
}
