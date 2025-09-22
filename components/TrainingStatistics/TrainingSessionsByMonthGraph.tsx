'use client';
import { AgCharts } from 'ag-charts-react';
import { useState, useEffect } from 'react';
import { AgCartesianChartOptions } from 'ag-charts-community';
import { useColorScheme } from '@mui/material/styles';

interface TrainingSessionChartData {
    month: string;
    sessions: number;
}

interface ChartProps {
    data: TrainingSessionChartData[];
}

const TrainingSessionsByMonthGraph = ({ data }: ChartProps) => {
    const { colorScheme } = useColorScheme();
    const [chartOptions, setChartOptions] = useState<AgCartesianChartOptions>({
        data: data,
        series: [{ type: 'bar', xKey: 'month', yKey: 'sessions' }],
        theme: colorScheme === 'dark' ? 'ag-polychroma-dark' : 'ag-polychroma',
        title: {
            text: 'Number of Training Sessions per Month',
        },
        axes: [
            {
                type: 'category',
                position: 'bottom',
                title: {
                    text: 'Month',
                },
            },
            {
                type: 'number',
                position: 'left',
                title: {
                    text: 'Number of Sessions',
                },
            },
        ],
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

export default TrainingSessionsByMonthGraph;