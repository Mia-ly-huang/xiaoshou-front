import React from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { SalesSummary } from '../types';

echarts.use([
  LineChart, BarChart, GridComponent, TooltipComponent,
  TitleComponent, LegendComponent, DataZoomComponent, CanvasRenderer,
]);

interface Props {
  summary: SalesSummary;
}

const RevenueTrendChart: React.FC<Props> = ({ summary }) => {
  const sorted = [...summary.monthly_revenue].sort((a, b) => a.year_month.localeCompare(b.year_month));

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number; seriesName: string }[])[0];
        return `${p.name}<br/>${p.seriesName}: ¥${p.value.toLocaleString()}`;
      },
    },
    legend: { data: ['销售额', '订单数'], top: 0 },
    grid: { left: 60, right: 60, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: sorted.map(m => m.year_month), axisLabel: { rotate: 45 } },
    yAxis: [
      { type: 'value', name: '¥', axisLabel: { formatter: (v: number) => (v / 10000).toFixed(0) + 'w' } },
      { type: 'value', name: '单' },
    ],
    dataZoom: [{ type: 'slider', bottom: 0, start: 0, end: 100 }],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: sorted.map(m => m.revenue),
        itemStyle: { color: '#1677ff' },
        areaStyle: { color: 'rgba(22,119,255,0.1)' },
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: sorted.map(m => m.orders),
        itemStyle: { color: 'rgba(82,196,26,0.5)' },
      },
    ],
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 380, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
};

export default RevenueTrendChart;
