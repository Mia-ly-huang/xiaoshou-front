import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Spin, Tag, Space, Typography } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, BulbOutlined } from '@ant-design/icons';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, PieChart, LineChart } from 'echarts/charts';
import {
  GridComponent, TooltipComponent, TitleComponent, LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { SalesSummary, AiQueryResult } from '../types';
import { getSuggestions } from '../utils/nlp';

echarts.use([
  BarChart, PieChart, LineChart, GridComponent,
  TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer,
]);

const { Text } = Typography;

interface Props {
  summary: SalesSummary;
  onAsk: (query: string) => Promise<AiQueryResult>;
}

const AiChatPanel: React.FC<Props> = ({ summary, onAsk }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string; chart?: AiQueryResult }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const suggestions = getSuggestions();

  const handleSend = async (q: string = input.trim()) => {
    if (!q || loading) return;
    setInput('');
    setLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: q }]);
    try {
      const result = await onAsk(q);
      setChatHistory(prev => [...prev, { role: 'ai', content: result.answer, chart: result }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'ai', content: '抱歉，查询出错了，请重试。' }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const renderChart = (r: AiQueryResult) => {
    if (!r.chartType || r.chartType === 'none' || !r.chartData) return null;

    const data = r.chartData as { name: string; value: number }[];
    let option: echarts.EChartsCoreOption;

    const typeColors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2', '#f5222d', '#2f54eb', '#faad14', '#a0d911'];

    if (r.chartType === 'pie') {
      option = {
        tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data: data.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: typeColors[i % typeColors.length] } })),
          itemStyle: { borderRadius: 2, borderColor: '#fff', borderWidth: 1.5 },
        }],
      };
    } else if (r.chartType === 'line') {
      option = {
        tooltip: { trigger: 'axis', formatter: (p: unknown) => {
          const d = (p as { name: string; value: number }[])[0];
          return `${d.name}<br/>¥${d.value.toLocaleString()}`;
        }},
        grid: { left: 50, right: 20, top: 20, bottom: 40 },
        xAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { rotate: 45, fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { formatter: (v: number) => (v / 10000).toFixed(0) + 'w' } },
        series: [{
          type: 'line',
          smooth: true,
          data: data.map(d => d.value),
          itemStyle: { color: '#1677ff' },
          areaStyle: { color: 'rgba(22,119,255,0.08)' },
        }],
      };
    } else {
      option = {
        tooltip: { trigger: 'axis', formatter: (p: unknown) => {
          const d = (p as { name: string; value: number }[])[0];
          return `${d.name}<br/>¥${d.value.toLocaleString()}`;
        }},
        grid: { left: 55, right: 25, top: 15, bottom: 30 },
        xAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { rotate: 45, fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { formatter: (v: number) => (v / 10000).toFixed(0) + 'w' } },
        series: [{
          type: 'bar',
          data: data.map((d, i) => ({
            value: d.value,
            itemStyle: { color: typeColors[i % typeColors.length], borderRadius: [4, 4, 0, 0] },
          })),
          barMaxWidth: 40,
        }],
      };
    }

    return (
      <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: 8 }}>
        {r.chartTitle && <Text strong style={{ fontSize: 12, paddingLeft: 8 }}>{r.chartTitle}</Text>}
        <ReactEChartsCore echarts={echarts} option={option} style={{ height: 220, width: '100%' }} notMerge lazyUpdate />
      </div>
    );
  };

  return (
    <Card
      title={<span><RobotOutlined style={{ marginRight: 8 }} />AI 经营助手</span>}
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', height: '100%' }}
      bodyStyle={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 57px)' }}
    >
      {/* 建议问题 */}
      <div style={{ marginBottom: 12 }}>
        <Space wrap size={[4, 6]}>
          <BulbOutlined style={{ color: '#fa8c16' }} />
          {suggestions.slice(0, 6).map((s, i) => (
            <Tag
              key={i}
              style={{ cursor: 'pointer', borderRadius: 12, padding: '2px 12px', fontSize: 12 }}
              color="blue"
              onClick={() => handleSend(s)}
            >
              {s}
            </Tag>
          ))}
        </Space>
      </div>

      {/* 对话历史 */}
      <div
        ref={chatRef}
        style={{
          flex: 1, overflowY: 'auto', marginBottom: 12, paddingRight: 4,
          minHeight: 200, maxHeight: 480, background: '#fafafa', borderRadius: 8, padding: 12,
        }}
      >
        {chatHistory.length === 0 && (
          <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 60, fontSize: 14 }}>
            <RobotOutlined style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
            点击上方问题或直接输入提问
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'ai' ? '#e6f4ff' : '#f0f5ff',
              color: msg.role === 'ai' ? '#1677ff' : '#595959',
            }}>
              {msg.role === 'ai' ? <RobotOutlined /> : <UserOutlined />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                background: msg.role === 'ai' ? '#fff' : '#e6f4ff',
                padding: '10px 14px', borderRadius: 12,
                fontSize: 13, lineHeight: '1.8', whiteSpace: 'pre-wrap',
                border: msg.role === 'ai' ? '1px solid #f0f0f0' : 'none',
              }}>
                {msg.content}
              </div>
              {msg.chart && renderChart(msg.chart)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <Spin size="small" /> <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>分析中...</Text>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={() => handleSend()}
          placeholder="输入问题，如：哪个城市销售额最高？"
          style={{ borderRadius: 20, fontSize: 13 }}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => handleSend()}
          loading={loading}
          shape="circle"
          style={{ background: '#1677ff', borderColor: '#1677ff' }}
        />
      </div>
    </Card>
  );
};

export default AiChatPanel;
