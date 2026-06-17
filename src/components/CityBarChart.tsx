import React from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { SalesSummary } from '../types';

echarts.use([BarChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

interface Props {
  summary: SalesSummary;
}

const CityBarChart: React.FC<Props> = ({ summary }) => {
  const sorted = [...summary.by_city].sort((a, b) => b.revenue - a.revenue);

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number }[])[0];
        return `${p.name}<br/>销售额: ¥${p.value.toLocaleString()}`;
      },
    },
    grid: { left: 60, right: 30, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: sorted.map(c => c.city),
      axisLabel: { fontSize: 13 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => (v / 10000).toFixed(0) + 'w' },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((c, i) => ({
          value: c.revenue,
          itemStyle: {
            color: ['#1677ff', '#52c41a', '#fa8c16', '#722ed1'][i % 4],
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top',
          formatter: (p: unknown) => {
            const v = (p as { value: number }).value;
            return '¥' + (v / 10000).toFixed(1) + 'w';
          },
          fontSize: 12,
          fontWeight: 'bold',
        },
      },
    ],
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 320, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
};

export default CityBarChart;
