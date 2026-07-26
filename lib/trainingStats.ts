// Pure training-stats display helpers (client-safe; no Prisma). The aggregation
// itself now lives in osmium (`GET /api/v1/training/stats`); this only turns
// passed/failed counts into a labelled pass-rate chip.

type PassRateResult = {
    percentage: number;
    color: 'success' | 'warning' | 'error' | 'default';
    totalEvaluated: number;
};

export function calculatePassRate(passedCount: number, failedCount: number): PassRateResult {
    const totalEvaluated = passedCount + failedCount;
    let percentage = 0;
    let color: PassRateResult['color'] = 'default';

    if (totalEvaluated > 0) {
        percentage = (passedCount / totalEvaluated) * 100;

        if (percentage >= 80) {
            color = 'success';
        } else if (percentage >= 50) {
            color = 'warning';
        } else {
            color = 'error';
        }
    }

    return {
        percentage: parseFloat(percentage.toFixed(2)),
        color,
        totalEvaluated,
    };
}
