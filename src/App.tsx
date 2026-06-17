import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Spin, Tabs } from 'antd';
import { BarChartOutlined, MessageOutlined } from '@ant-design/icons';
import KPICards from './components/KPICards';
import RevenueTrendChart from './components/RevenueTrendChart';
import CategoryPieChart from './components/CategoryPieChart';
import CityBarChart from './components/CityBarChart';
import PaymentPieChart from './components/PaymentPieChart';
import CustomerTypeChart from './components/CustomerTypeChart';
import TopProductsChart from './components/TopProductsChart';
import AiChatPanel from './components/AiChatPanel';
import { useData, useAiQuery } from './hooks/useData';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const { summary, loading } = useData();
  const ai = useAiQuery();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAiAsk = async (q: string) => {
    return ai.ask(q, summary!);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  if (!summary) {
    return <div style={{ textAlign: 'center', padding: 100 }}>数据加载失败</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <Title level={4} style={{ margin: 0, color: '#1677ff' }}>📊 销售经营看板</Title>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: 0 }}
          items={[
            { key: 'dashboard', label: <span><BarChartOutlined />经营看板</span> },
            { key: 'ai', label: <span><MessageOutlined />AI 智能问答</span> },
          ]}
        />
      </Header>

      <Content style={{ padding: 20, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {activeTab === 'dashboard' ? (
          <>
            <KPICards summary={summary} />

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={16}>
                <Card title="月度销售趋势" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                  <RevenueTrendChart summary={summary} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="品类营收占比" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                  <CategoryPieChart summary={summary} />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={12}>
                <Card title="各城市销售额" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                  <CityBarChart summary={summary} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="TOP10 畅销产品" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                  <TopProductsChart summary={summary} />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} lg={8}>
                <Card title="支付方式分布" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                  <PaymentPieChart summary={summary} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card title="客户类型对比" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                  <CustomerTypeChart summary={summary} />
                </Card>
              </Col>
              <Col xs={24} sm={24} lg={8}>
                <Card title="数据概览" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                  <div style={{ padding: '12px 0', fontSize: 13, lineHeight: '2.2', color: '#555' }}>
                    <div>数据时间：<strong>{summary.overview.date_range_start}</strong> ~ <strong>{summary.overview.date_range_end}</strong></div>
                    <div>跨度：<strong>{summary.overview.total_months} 个月</strong></div>
                    <div>总营收：<strong>¥{summary.overview.total_revenue.toLocaleString()}</strong></div>
                    <div>总订单：<strong>{summary.overview.total_orders.toLocaleString()} 单</strong></div>
                    <div>均单金额：<strong>¥{summary.overview.avg_order_value.toFixed(0)}</strong></div>
                    <div>商品种类：<strong>{summary.overview.unique_products} 种</strong></div>
                    <div>均单价：<strong>¥{summary.overview.avg_unit_price.toFixed(2)}</strong></div>
                    <div>均数量：<strong>{summary.overview.avg_quantity.toFixed(1)} 件</strong></div>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <AiChatPanel summary={summary} onAsk={handleAiAsk} />
            </Col>
            <Col xs={24} lg={8}>
              <Card title="快捷查询" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#666', lineHeight: '2.2' }}>
                  <p><strong>城市相关：</strong>"哪个城市销售额最高？"、"广州的销售情况？"</p>
                  <p><strong>品类相关：</strong>"各类目占比？"、"食品类卖了多少？"</p>
                  <p><strong>产品相关：</strong>"最畅销的产品是什么？"</p>
                  <p><strong>支付相关：</strong>"支付方式占比？"、"微信支付占比多少？"</p>
                  <p><strong>客户相关：</strong>"会员消费占比多少？"、"男女消费对比？"</p>
                  <p><strong>趋势相关：</strong>"月度销售趋势？"、"上个月情况？"</p>
                  <p><strong>总览：</strong>"总体经营概况？"</p>
                </div>
              </Card>
              <Card title="数据摘要" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                <div style={{ fontSize: 13, color: '#555', lineHeight: '2' }}>
                  <div>数据类型：销售订单明细</div>
                  <div>总记录数：{summary.overview.total_orders.toLocaleString()}</div>
                  <div>覆盖城市：北京、上海、广州、深圳</div>
                  <div>品类：食品、饮料、水果、日用品</div>
                  <div>支付：微信、支付宝、信用卡、现金</div>
                </div>
              </Card>
              {ai.history.length > 0 && (
                <Card title="历史查询" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginTop: 16 }}>
                  <div style={{ maxHeight: 300, overflowY: 'auto', fontSize: 12, lineHeight: '2' }}>
                    {ai.history.slice(0, 10).map((h, i) => (
                      <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => handleAiAsk(h.q)}>
                        <span style={{ color: '#999' }}>Q:</span> {h.q}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default App;
