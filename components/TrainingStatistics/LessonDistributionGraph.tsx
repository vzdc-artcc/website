'use client';
import { AgCharts } from 'ag-charts-react';
import { useState, useEffect } from 'react';
import { AgChartOptions } from 'ag-charts-community';
import { useColorScheme } from '@mui/material/styles';

interface LessonDistributionData {
    lesson: string;
    passed: number;
    failed: number;
}

interface ChartProps {
    data: LessonDistributionData[];
}

const LessonDistributionGraph = ({ data }: ChartProps) => {
    const { colorScheme } = useColorScheme();
    const [chartOptions, setChartOptions] = useState<AgChartOptions>({
        data: data,
        theme: colorScheme === 'dark' ? 'ag-polychroma-dark' : 'ag-polychroma',
        title: {
            text: 'Lesson Distribution',
        },
        series: [
            { type: 'bar', xKey: 'lesson', yKey: 'passed', stacked: true },
            { type: 'bar', xKey: 'lesson', yKey: 'failed', stacked: true },
        ],
        axes: [
            {
                type: 'category',
                position: 'bottom',
                title: {
                    text: 'Lesson',
                },
            },
            {
                type: 'number',
                position: 'left',
                title: {
                    text: 'Number of Lessons',
                },
            },
        ],
        height: 600, // Set the height within the options object
    });

    useEffect(() => {
        setChartOptions((prevOptions) => ({
            ...prevOptions,
            data: data,
            theme: colorScheme === 'dark' ? 'ag-polychroma-dark' : 'ag-polychroma',
        }));
    }, [data, colorScheme]);

    return <AgCharts options={chartOptions} />;
};

export default LessonDistributionGraph;