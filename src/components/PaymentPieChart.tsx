import React from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { SalesSummary } from '../types';

echarts.use([PieChart, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

const PAY_COLORS: Record<string, string> = {
  '微信': '#07c160',
  '支付宝': '#1677ff',
  '信用卡': '#fa8c16',
  '现金': '#8c8c8c',
};

interface Props {
  summary: SalesSummary;
}

const PaymentPieChart: React.FC<Props> = ({ summary }) => {
  const option: echarts.EChartsCoreOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { top: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '72%'],
        center: ['50%', '55%'],
        label: { formatter: '{b}\n{d}%' },
        data: summary.by_payment.map(p => ({
          name: p.payment_method,
          value: p.revenue,
          itemStyle: { color: PAY_COLORS[p.payment_method] || '#999' },
        })),
        itemStyle: { borderRadius: 3, borderColor: '#fff', borderWidth: 2 },
      },
    ],
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

export default PaymentPieChart;
