import React from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { SalesSummary } from '../types';

echarts.use([PieChart, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

interface Props {
  summary: SalesSummary;
}

const CustomerTypeChart: React.FC<Props> = ({ summary }) => {
  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p: unknown) => {
        const d = p as { name: string; value: number; percent: number };
        return `${d.name}<br/>¥${d.value.toLocaleString()} (${d.percent}%)`;
      },
    },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['50%', '45%'],
        label: {
          formatter: (p: unknown) => {
            const d = p as { name: string; percent: number };
            return `${d.name}\n${d.percent}%`;
          },
        },
        data: summary.by_customer_type.map(c => ({
          name: c.customer_type,
          value: c.revenue,
        })),
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 3 },
      },
    ],
    color: ['#1677ff', '#d9d9d9'],
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 280, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
};

export default CustomerTypeChart;
