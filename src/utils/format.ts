/** 格式化金额 (万元) */
export function formatWan(val: number): string {
  return (val / 10000).toFixed(1) + '万';
}

/** 格式化金额 (元, 千分位) */
export function formatMoney(val: number): string {
  return '¥' + val.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** 格式化百分比 */
export function formatPct(val: number, total: number): string {
  if (total === 0) return '0%';
  return ((val / total) * 100).toFixed(1) + '%';
}

/** 短日期 */
export function shortDate(d: string): string {
  return d.replace(/^\d{4}-/, '');
}
