'use client';
import {
    BarSeriesModule,
    CartesianChartModule,
    CategoryAxisModule,
    LegendModule,
    ModuleRegistry,
    NumberAxisModule,
} from 'ag-charts-community';

// AG Charts v13+ renders nothing until the chart features in use are registered.
// Import this file from any component that renders an AgCharts chart.
ModuleRegistry.registerModules([
    CartesianChartModule,
    BarSeriesModule,
    CategoryAxisModule,
    NumberAxisModule,
    LegendModule,
]);
