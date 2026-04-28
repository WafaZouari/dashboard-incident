export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  withInvestigation: number;
  thisMonthCount: number;
  lastMonthCount: number;
  changePercent: number;
  avgSeverity: number;
  closed: number;
  investigationRate: number;
}

export interface TrendDataPoint {
  month: string;
  date: string;
  count: number;
  avgSeverity: number;
}

export interface TypeDataPoint {
  id: string;
  name: string;
  count: number;
}

export interface LocationDataPoint {
  id: string;
  name: string;
  count: number;
}

export interface SeverityDataPoint {
  severity: number;
  count: number;
}
