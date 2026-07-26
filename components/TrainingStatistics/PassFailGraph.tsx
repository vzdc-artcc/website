'use client';
import {AgCharts} from 'ag-charts-react';
import {useEffect, useState} from 'react';
import {AgChartOptions} from 'ag-charts-community';
import {useColorScheme} from '@mui/material/styles';

interface ChartProps {
    passed: number;
    failed: number;
}

const buildData = (passed: number, failed: number) => [
    {outcome: 'Passed', count: passed, fill: '#66bb6a'},
    {outcome: 'Failed', count: failed, fill: '#f44336'},
];

const PassFailGraph = ({passed, failed}: ChartProps) => {
    const {colorScheme} = useColorScheme();
    const [chartOptions, setChartOptions] = useState<AgChartOptions>({
        data: buildData(passed, failed),
        theme: colorScheme === 'dark' ? 'ag-polychroma-dark' : 'ag-polychroma',
        title: {text: 'Pass / Fail'},
        series: [
            {
                type: 'donut',
                calloutLabelKey: 'outcome',
                angleKey: 'count',
                fills: ['#66bb6a', '#f44336'],
                innerRadiusRatio: 0.6,
                calloutLabel: {enabled: true},
                sectorLabelKey: 'count',
            } as never,
        ],
        height: 400,
    });

    useEffect(() => {
        setChartOptions((prev) => ({
            ...prev,
            data: buildData(passed, failed),
            theme: colorScheme === 'dark' ? 'ag-polychroma-dark' : 'ag-polychroma',
        }));
    }, [passed, failed, colorScheme]);

    if (passed === 0 && failed === 0) {
        return null;
    }

    return <AgCharts options={chartOptions}/>;
};

export default PassFailGraph;
