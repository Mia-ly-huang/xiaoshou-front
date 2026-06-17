/**
 * 轻量级中文 NLP 查询解析器
 * 支持自然语言查询销售数据，提取意图和实体
 */

import axios from 'axios'
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
const api = axios.create({ baseURL, timeout:12000 })

import type { SalesSummary, AiQueryResult } from '../types';

type QueryHandler = (query: string, data: SalesSummary) => AiQueryResult;

const handlers: { patterns: RegExp[]; fn: QueryHandler }[] = [
  // ============ 城市相关 ============
  {
    patterns: [/哪个城市.*(?:销售额|营收|收入).*(?:最高|最多|最好)/, /哪个城市.*卖.*(?:最好|最多)/, /(?:销售额|营收|收入).*最高.*城市/],
    fn: (_, d) => {
      const sorted = [...d.by_city].sort((a, b) => b.revenue - a.revenue);
      const top = sorted[0];
      return {
        answer: `${top.city}销售额最高，达到 ¥${top.revenue.toLocaleString()}（${top.orders} 单，均单 ¥${top.avg_order.toFixed(0)}）。其次为 ${sorted[1].city} ¥${sorted[1].revenue.toLocaleString()}、${sorted[2].city} ¥${sorted[2].revenue.toLocaleString()}。`,
        chartType: 'bar',
        chartData: d.by_city.map(c => ({ name: c.city, value: c.revenue })),
        chartTitle: '各城市销售额对比',
      };
    },
  },
  {
    patterns: [/(.+)市?(?:的)?(?:销售额|营收|收入|订单)/],
    fn: (q, d) => {
      const city = extractCity(q);
      if (!city) return unknownAnswer();
      const c = d.by_city.find(x => x.city === city);
      if (!c) return { answer: `未找到城市 "${city}" 的数据`, chartType: 'none' };
      const pct = ((c.revenue / d.overview.total_revenue) * 100).toFixed(1);
      return {
        answer: `${city}总销售额 ¥${c.revenue.toLocaleString()}，${c.orders} 单，均单 ¥${c.avg_order.toFixed(0)}，占整体营收 ${pct}%。`,
        chartType: 'bar',
        chartData: d.by_city.map(x => ({ name: x.city, value: x.revenue })),
        chartTitle: `${city} vs 其他城市`,
      };
    },
  },

  // ============ 品类相关 ============
  {
    patterns: [/哪个.*(?:品类|类目|分类).*(?:最高|最多|最好)/, /(?:品类|类目).*占比/, /什么.*(?:品类|类目).*(?:卖.*好|畅销)/],
    fn: (_, d) => {
      const sorted = [...d.by_category].sort((a, b) => b.revenue - a.revenue);
      return {
        answer: `四大品类营收排名：${sorted.map((c, i) => `${i + 1}. ${c.product_category} ¥${c.revenue.toLocaleString()}（${c.orders}单）`).join('；')}`,
        chartType: 'pie',
        chartData: d.by_category.map(c => ({ name: c.product_category, value: c.revenue })),
        chartTitle: '品类营收占比',
      };
    },
  },
  {
    patterns: [/(.+)类(?:的)?(?:销售额|营收|卖了多少)/],
    fn: (q, d) => {
      const cat = extractCategory(q);
      if (!cat) return unknownAnswer();
      const c = d.by_category.find(x => x.product_category === cat);
      if (!c) return { answer: `未找到品类 "${cat}" 的数据。现有品类：${d.by_category.map(x => x.product_category).join('、')}`, chartType: 'none' };
      const pct = ((c.revenue / d.overview.total_revenue) * 100).toFixed(1);
      return {
        answer: `${cat}类总销售额 ¥${c.revenue.toLocaleString()}，${c.orders} 单，均单 ¥${c.avg_order.toFixed(0)}，占整体 ${pct}%。`,
        chartType: 'pie',
        chartData: d.by_category.map(x => ({ name: x.product_category, value: x.revenue })),
        chartTitle: `${cat}类占比`,
      };
    },
  },

  // ============ 支付方式 ============
  {
    patterns: [/支付.*占比/, /哪种支付.*(?:最多|最高|最常用)/, /(?:微信|支付宝|现金|信用卡).*占比/],
    fn: (_, d) => {
      const sorted = [...d.by_payment].sort((a, b) => b.revenue - a.revenue);
      return {
        answer: `支付方式排名：${sorted.map((p, i) => `${i + 1}. ${p.payment_method} ¥${p.revenue.toLocaleString()}（${p.orders}单）`).join('；')}`,
        chartType: 'pie',
        chartData: d.by_payment.map(p => ({ name: p.payment_method, value: p.revenue })),
        chartTitle: '支付方式分布',
      };
    },
  },

  // ============ 客户类型 ============
  {
    patterns: [/会员.*占比|普通.*占比|客户类型.*占比|会员.*消费|哪个.*客户.*(?:多|高)/],
    fn: (_, d) => {
      const member = d.by_customer_type.find(x => x.customer_type === '会员')!;
      const normal = d.by_customer_type.find(x => x.customer_type === '普通')!;
      const mpct = ((member.revenue / d.overview.total_revenue) * 100).toFixed(1);
      return {
        answer: `会员消费 ¥${member.revenue.toLocaleString()}（${member.orders}单，占${mpct}%），普通客户 ¥${normal.revenue.toLocaleString()}（${normal.orders}单）。会员均单 ¥${member.avg_order.toFixed(0)} vs 普通 ¥${normal.avg_order.toFixed(0)}。`,
        chartType: 'pie',
        chartData: d.by_customer_type.map(c => ({ name: c.customer_type, value: c.revenue })),
        chartTitle: '客户类型对比',
      };
    },
  },

  // ============ 畅销产品 ============
  {
    patterns: [/最畅销|卖得最好|销量最高|TOP\s*10|排名.*产品|热销.*产品|什么.*产品.*(?:好|多|畅销)/],
    fn: (_, d) => {
      const top5 = d.top_products.slice(0, 5);
      return {
        answer: `TOP5 畅销产品：${top5.map((p, i) => `${i + 1}. ${p.product_name} ¥${p.revenue.toLocaleString()}（${p.orders}单）`).join('；')}`,
        chartType: 'bar',
        chartData: d.top_products.slice(0, 10).map(p => ({ name: p.product_name, value: p.revenue })),
        chartTitle: 'TOP10 畅销产品',
      };
    },
  },

  // ============ 月度趋势 ============
  {
    patterns: [/(?:月度|每月|各月).*(?:趋势|变化|销售额)/, /销售.*(?:趋势|走势|变化)/, /营收.*(?:趋势|走势)/],
    fn: (_, d) => {
      const sorted = [...d.monthly_revenue].sort((a, b) => a.year_month.localeCompare(b.year_month));
      const best = sorted.reduce((a, b) => (b.revenue > a.revenue ? b : a));
      const worst = sorted.reduce((a, b) => (b.revenue < a.revenue ? b : a));
      const recent = sorted.slice(-3);
      return {
        answer: `共 ${d.overview.total_months} 个月数据。销售额最高：${best.year_month} ¥${best.revenue.toLocaleString()}；最低：${worst.year_month} ¥${worst.revenue.toLocaleString()}。最近3个月：${recent.map(m => `${m.year_month} ¥${m.revenue.toLocaleString()}`).join('、')}。`,
        chartType: 'line',
        chartData: sorted.map(m => ({ name: m.year_month, value: m.revenue })),
        chartTitle: '月度销售额趋势',
      };
    },
  },

  // ============ 上个月 ============
  {
    patterns: [/上个月.*(?:销售|营收|收入|多少)/, /最近.*一个月.*(?:销售|营收|情况)/],
    fn: (_, d) => {
      const months = [...d.monthly_revenue].sort((a, b) => a.year_month.localeCompare(b.year_month));
      if (months.length < 2) return { answer: '数据不足，无法对比。', chartType: 'none' };
      const last = months[months.length - 1];
      const prev = months[months.length - 2];
      const change = ((last.revenue - prev.revenue) / prev.revenue * 100).toFixed(1);
      const arrow = +change >= 0 ? '↑' : '↓';
      return {
        answer: `${last.year_month} 销售额 ¥${last.revenue.toLocaleString()}（${last.orders}单），较上月 ${arrow}${Math.abs(+change)}%。均单 ¥${last.avg_order.toFixed(0)}。`,
        chartType: 'line',
        chartData: months.slice(-6).map(m => ({ name: m.year_month, value: m.revenue })),
        chartTitle: '近6个月趋势',
      };
    },
  },

  // ============ 总体概览 ============
  {
    patterns: [/总体|整体|概览|概况|总结|汇总|经营.*(?:情况|数据)/],
    fn: (_, d) => {
      const o = d.overview;
      return {
        answer: `📊 经营概览：
• 总订单：${o.total_orders.toLocaleString()} 单
• 总营收：¥${o.total_revenue.toLocaleString()}
• 均单金额：¥${o.avg_order_value.toFixed(0)}
• 商品数：${o.unique_products} 种
• 时间跨度：${o.date_range_start} 至 ${o.date_range_end}（${o.total_months}个月）`,
        chartType: 'none',
      };
    },
  },

  // ============ 性别 ============
  {
    patterns: [/男女.*占比|性别.*占比|男性.*消费|女性.*消费/],
    fn: (_, d) => {
      const male = d.by_gender.find(x => x.gender === '男')!;
      const female = d.by_gender.find(x => x.gender === '女')!;
      return {
        answer: `男性消费 ¥${male.revenue.toLocaleString()}（${male.orders}单，均单¥${male.avg_order.toFixed(0)}），女性消费 ¥${female.revenue.toLocaleString()}（${female.orders}单，均单¥${female.avg_order.toFixed(0)}）。`,
        chartType: 'pie',
        chartData: d.by_gender.map(g => ({ name: g.gender, value: g.revenue })),
        chartTitle: '性别消费对比',
      };
    },
  },

  // ============ 今天/本周 (回退到最新数据) ============
  {
    patterns: [/今天|今日|最近.*天/],
    fn: (_, d) => {
      const recent = d.daily_revenue.slice(-7);
      const total = recent.reduce((s, r) => s + r.revenue, 0);
      return {
        answer: `最近7天总销售额 ¥${total.toLocaleString()}，日均 ¥${Math.round(total / recent.length).toLocaleString()}。`,
        chartType: 'line',
        chartData: recent.map(r => ({ name: r.date, value: r.revenue })),
        chartTitle: '最近7天日销售额',
      };
    },
  },
];

// ============ 实体提取 ============

const cities = ['北京', '上海', '广州', '深圳'];
const categories = ['食品', '饮料', '水果', '日用品'];

function extractCity(q: string): string | null {
  for (const c of cities) {
    if (q.includes(c)) return c;
  }
  return null;
}

function extractCategory(q: string): string | null {
  for (const c of categories) {
    if (q.includes(c)) return c;
  }
  return null;
}

// ============ 主入口 ============

export function parseQuery(query: string, data: SalesSummary): AiQueryResult {
  const q = query.trim();
  if (!q) return { answer: '请输入您想了解的问题，例如："哪个城市销售额最高？"、"上个月销售情况？"、"最畅销的产品是什么？"', chartType: 'none' };

  // 尝试匹配所有处理器
  for (const handler of handlers) {
    for (const pat of handler.patterns) {
      if (pat.test(q)) {
        return handler.fn(q, data);
      }
    }
  }

  // 回退：关键词匹配
  return fallbackAnswer(q, data);
}

function fallbackAnswer(q: string, d: SalesSummary): AiQueryResult {
  // 包含"城市"关键词
  if (/城市/.test(q)) {
    return {
      answer: `各城市营收：${d.by_city.map(c => `${c.city} ¥${c.revenue.toLocaleString()}`).join('、')}`,
      chartType: 'bar',
      chartData: d.by_city.map(c => ({ name: c.city, value: c.revenue })),
      chartTitle: '城市销售额',
    };
  }

  // 包含"品类"或"类目"
  if (/品类|类目|分类/.test(q)) {
    return {
      answer: `各品类营收：${d.by_category.map(c => `${c.product_category} ¥${c.revenue.toLocaleString()}`).join('、')}`,
      chartType: 'pie',
      chartData: d.by_category.map(c => ({ name: c.product_category, value: c.revenue })),
      chartTitle: '品类分布',
    };
  }

  return unknownAnswer();
}

function unknownAnswer(): AiQueryResult {
  return {
    answer: '抱歉，我还不能理解这个问题。你可以试试：\n• "哪个城市销售额最高？"\n• "上个月销售情况？"\n• "最畅销的产品是什么？"\n• "支付方式占比"\n• "月度销售趋势"\n• "总体经营概况"',
    chartType: 'none',
  };
}

/** 获取建议问题 */
export function getSuggestions(): string[] {
  return [
    '哪个城市销售额最高？',
    '上个月销售情况？',
    '最畅销的产品是什么？',
    '支付方式占比',
    '月度销售趋势',
    '会员消费占比多少？',
    '各类目营收排名',
    '总体经营概况',
  ];
}
