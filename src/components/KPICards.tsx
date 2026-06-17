import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { SalesSummary } from '../types';

interface Props {
  summary: SalesSummary;
}

const KPICards: React.FC<Props> = ({ summary }) => {
  const o = summary.overview;
  const cards = [
    {
      title: '总营收',
      value: o.total_revenue,
      prefix: <DollarOutlined />,
      format: (v: number) => '¥' + v.toLocaleString('zh-CN'),
      color: '#1677ff',
    },
    {
      title: '总订单数',
      value: o.total_orders,
      prefix: <ShoppingCartOutlined />,
      format: (v: number) => v.toLocaleString('zh-CN') + ' 单',
      color: '#52c41a',
    },
    {
      title: '平均客单价',
      value: o.avg_order_value,
      prefix: <RiseOutlined />,
      format: (v: number) => '¥' + v.toFixed(0),
      color: '#fa8c16',
    },
    {
      title: '商品种类',
      value: o.unique_products,
      prefix: <AppstoreOutlined />,
      format: (v: number) => v + ' 种',
      color: '#722ed1',
    },
  ];

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      {cards.map((c, i) => (
        <Col xs={12} sm={12} md={6} key={i}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#666' }}>{c.title}</span>}
              value={c.value}
              prefix={c.prefix}
              formatter={(v) => c.format(v as number)}
              valueStyle={{ color: c.color, fontSize: 26, fontWeight: 700 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default KPICards;
