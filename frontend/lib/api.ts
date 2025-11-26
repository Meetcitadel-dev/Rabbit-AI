const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export type KPIBlock = {
  total_sales: number;
  total_units: number;
  avg_discount: number;
  marketing_efficiency: number;
  growth_vs_prev_period: number;
};

export async function fetchFilters() {
  const res = await fetch(`${API_BASE}/api/filters`);
  if (!res.ok) throw new Error("Failed to load filters");
  return res.json();
}

export async function fetchKpis(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/metrics/kpi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load KPIs");
  return (await res.json()) as KPIBlock;
}

export async function fetchSeries(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/metrics/series?metric=net_sales&freq=M`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load time series");
  return (await res.json()).data as { period: string; value: number }[];
}

export async function fetchBreakdown(filters: Record<string, unknown>, groupBy = "region") {
  const res = await fetch(`${API_BASE}/api/metrics/breakdown?group_by=${groupBy}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load breakdown");
  return (await res.json()).data as { [key: string]: string | number }[];
}

export async function askChat(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function synthesizeVoice(text: string) {
  const res = await fetch(`${API_BASE}/api/voice/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Voice synthesis failed");
  return res.json();
}

export async function transcribeAudio(blob: Blob) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  const res = await fetch(`${API_BASE}/api/voice/transcribe`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Transcription failed");
  return res.json();
}

export async function fetchRecommendations(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/insights/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load recommendations");
  return (await res.json()).items as string[];
}

export async function fetchAnomalies(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/insights/anomalies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load anomalies");
  return (await res.json()).items as {
    date: string;
    metric: string;
    value: number;
    z_score: number;
  }[];
}

export async function fetchInventorySummary(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/inventory/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load inventory summary");
  return res.json();
}

export async function fetchInventorySeries(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/inventory/series`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load inventory series");
  return (await res.json()).points as {
    date: string;
    inventory: number;
    forecast: number;
  }[];
}

export async function fetchSupplySummary(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/supply/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load supply metrics");
  return res.json();
}

export async function fetchMarketingPerformance(filters: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/marketing/performance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to load marketing performance");
  return (await res.json()).campaigns as {
    campaign_name: string;
    net_sales: number;
    marketing_spend: number;
    roi: number;
  }[];
}

