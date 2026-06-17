/** 清洗后单条销售记录 */
export interface SalesRecord {
  order_id: number;
  order_date: string;
  customer_type: string;
  gender: string;
  product_category: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  tax_rate: number;
  total_price: number;
  payment_method: string;
  city: string;
  year?: number;
  month?: number;
  day?: number;
  day_of_week?: number;
  year_month?: string;
  is_weekend?: number;
  subtotal?: number;
  tax_amount?: number;
}

/** 聚合统计项 */
export interface AggItem {
  revenue: number;
  orders: number;
  avg_order: number;
}

/** 类目统计 */
export interface CategoryStat extends AggItem {
  product_category: string;
}

/** 城市统计 */
export interface CityStat extends AggItem {
  city: string;
}

/** 客户类型统计 */
export interface CustomerTypeStat extends AggItem {
  customer_type: string;
}

/** 支付方式统计 */
export interface PaymentStat extends AggItem {
  payment_method: string;
}

/** 性别统计 */
export interface GenderStat extends AggItem {
  gender: string;
}

/** 月度统计 */
export interface MonthlyStat extends AggItem {
  year_month: string;
}

/** 日销售 */
export interface DailyRevenue {
  date: string;
  revenue: number;
}

/** Top产品 */
export interface TopProduct {
  product_name: string;
  revenue: number;
  orders: number;
}

/** 数据摘要 */
export interface SalesSummary {
  generated_at: string;
  overview: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    avg_unit_price: number;
    avg_quantity: number;
    unique_products: number;
    date_range_start: string;
    date_range_end: string;
    total_months: number;
  };
  monthly_revenue: MonthlyStat[];
  by_category: CategoryStat[];
  by_city: CityStat[];
  by_customer_type: CustomerTypeStat[];
  by_payment: PaymentStat[];
  by_gender: GenderStat[];
  top_products: TopProduct[];
  daily_revenue: DailyRevenue[];
}

/** AI 查询结果 */
export interface AiQueryResult {
  answer: string;
  chartType?: 'bar' | 'pie' | 'line' | 'none';
  chartData?: Record<string, unknown>[];
  chartTitle?: string;
}

/** 数据缓存 */
let _summaryCache: SalesSummary | null = null;

export async function fetchSummary(): Promise<SalesSummary> {
  if (_summaryCache) return _summaryCache;
  const res = await fetch('/data/sales_summary.json');
  _summaryCache = await res.json();
  return _summaryCache!;
}

export async function fetchRecords(): Promise<SalesRecord[]> {
  const res = await fetch('/data/sales_clean.json');
  return res.json();
}
