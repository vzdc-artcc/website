import { Card, CardContent, Typography } from '@mui/material';
import TrainingSessionsPerMonthGraph from '@/components/TrainingStatistics/TrainingSessionsPerMonthGraph';
import {getLessonDistributionData, getPerMonthData} from "@/actions/trainingStats";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph"; // Corrected component import

export default async function Page() {
    const perMonthData = await getPerMonthData();
    const lessonDistributionData = await getLessonDistributionData();

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Training Stats
                </Typography>
                <TrainingSessionsPerMonthGraph data={perMonthData} />
            </CardContent>
            <CardContent>
                <LessonDistributionGraph data={lessonDistributionData} /> {/* Corrected component name */}
            </CardContent>
        </Card>
    );
}