export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  highPotential: number;
  thisMonthCount: number;
  lastMonthCount: number;
  changePercent: number;
  withInvestigation: number;
  avgSeverity: number;
  closed: number;
  investigationRate: number;
}

export interface TrendDataPoint {
  month: string;
  date: string;
  count: number;
  highPotential: number;
  avgSeverity: number;
}

export interface TypeDataPoint {
  id: number;
  name: string;
  category?: string | null;
  count: number;
}

export interface LocationDataPoint {
  id: number;
  name: string;
  site?: string | null;
  count: number;
}

export interface SeverityDataPoint {
  severity: number;
  count: number;
}
