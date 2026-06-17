import React from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { SalesSummary } from '../types';

echarts.use([BarChart, GridComponent, TooltipComponent, TitleComponent, DataZoomComponent, CanvasRenderer]);

interface Props {
  summary: SalesSummary;
}

const TopProductsChart: React.FC<Props> = ({ summary }) => {
  const top10 = summary.top_products.slice(0, 10).reverse();

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number }[])[0];
        return `${p.name}<br/>销售额: ¥${p.value.toLocaleString()}`;
      },
    },
    grid: { left: 90, right: 60, top: 10, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => (v / 10000).toFixed(0) + 'w' },
    },
    yAxis: {
      type: 'category',
      data: top10.map(p => p.product_name),
      axisLabel: { fontSize: 12 },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: top10.map(p => ({
          value: p.revenue,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#1677ff' },
              { offset: 1, color: '#69b1ff' },
            ]),
            borderRadius: [0, 6, 6, 0],
          },
        })),
        barMaxWidth: 28,
        label: {
          show: true,
          position: 'right',
          formatter: (p: unknown) => {
            const v = (p as { value: number }).value;
            return '¥' + (v / 10000).toFixed(1) + 'w';
          },
          fontSize: 11,
        },
      },
    ],
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 360, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
};

export default TopProductsChart;
