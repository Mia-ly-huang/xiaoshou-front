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

const CategoryPieChart: React.FC<Props> = ({ summary }) => {
  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        label: { formatter: '{b}\n{d}%' },
        emphasis: {
          label: { fontSize: 18, fontWeight: 'bold' },
        },
        data: summary.by_category.map(c => ({
          name: c.product_category,
          value: c.revenue,
        })),
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 3,
        },
      },
    ],
    color: ['#1677ff', '#52c41a', '#fa8c16', '#722ed1'],
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

export default CategoryPieChart;
