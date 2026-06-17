import { useState, useEffect } from 'react';
import type { SalesSummary, AiQueryResult } from '../types';
import { fetchSummary, fetchRecords } from '../types';
import { parseQuery } from '../utils/nlp';

export function useData() {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary().then(setSummary).finally(() => setLoading(false));
  }, []);

  return { summary, loading };
}

export function useAiQuery() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<AiQueryResult | null>(null);
  const [history, setHistory] = useState<{ q: string; r: AiQueryResult }[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async (query: string, summary: SalesSummary) => {
    setLoading(true);
    setQ(query);
    // 模拟思考延迟
    await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
    const r = parseQuery(query, summary);
    setResult(r);
    setHistory(prev => [{ q: query, r }, ...prev].slice(0, 20));
    setLoading(false);
    return r;
  };

  const clear = () => {
    setQ('');
    setResult(null);
  };

  return { q, result, history, loading, ask, clear };
}
