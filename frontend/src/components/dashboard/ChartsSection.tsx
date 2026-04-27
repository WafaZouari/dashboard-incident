import React from 'react';
import { Card, CardContent, Box, Typography, alpha, Grid } from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import useResponsive from '../../hooks/useResponsive';
import type { LocationDataPoint, SeverityDataPoint, TrendDataPoint, TypeDataPoint } from '../../types';
const CHART_COLORS = ['#F59E0B', '#06B6D4', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#EC4899', '#84CC16'];
const SEVERITY_COLORS = ['#10B981', '#84CC16', '#F59E0B', '#F97316', '#EF4444'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        background: 'rgba(15,32,64,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2, p: 1.5, backdropFilter: 'blur(10px)',
      }}>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="caption" sx={{ color: p.color, display: 'block', fontWeight: 600 }}>
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

interface ChartsSectionProps {
  trends: TrendDataPoint[];
  byType: TypeDataPoint[];
  byLocation: LocationDataPoint[];
  bySeverity: SeverityDataPoint[];
  loading?: boolean;
}

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; color?: string }> = ({
  title, subtitle, children, color = '#F59E0B',
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ width: 3, height: 16, borderRadius: 2, background: color }} />
          <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{title}</Typography>
        </Box>
        {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
      </Box>
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </CardContent>
  </Card>
);

const ChartsSection: React.FC<ChartsSectionProps> = ({ trends, byType, byLocation, bySeverity }) => {
  const { downSm, downMd } = useResponsive();
  const chartHeight = downSm ? 250 : (downMd ? 300 : 380);

  return (
    <Grid container spacing={2.5}>
      {/* Trend Line Chart (Main) */}
      <Grid size={{ xs: 12, md: 8 }}>
        <ChartCard title="Incident Trends" subtitle="Last 12 months — count & high potential">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={trends} margin={{ top: 5, right: 10, left: downSm ? -30 : -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94A3B8', fontSize: downSm ? 9 : 11 }}
                tickLine={false}
                axisLine={false}
                hide={downSm && trends.length > 6}
              />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {!downSm && <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />}
              <Line type="monotone" dataKey="count" name="Total" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: '#F59E0B' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="highPotential" name="High Potential" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2, fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* By Type — Pie Chart (Side) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="By Incident Type" subtitle="Distribution across categories" color="#06B6D4">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={byType.slice(0, 6)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={downSm ? 45 : 65}
                outerRadius={downSm ? 75 : 95}
                paddingAngle={3}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {byType.slice(0, 6).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              {!downSm && <Legend wrapperStyle={{ fontSize: '0.72rem' }} />}
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* By Location — Bar (Side/Bottom) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="By Location" subtitle="Incident count per site area" color="#10B981">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={byLocation.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={downSm ? 80 : 130}
                tick={{ fill: '#94A3B8', fontSize: downSm ? 9 : 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Incidents" fill={alpha('#10B981', 0.8)} radius={[0, 4, 4, 0]}>
                {byLocation.slice(0, 8).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Severity Distribution (Side/Bottom) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="By Severity" subtitle="Actual severity distribution" color="#EF4444">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={bySeverity} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="severity" tickFormatter={(v) => `S${v}`} tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                {bySeverity.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index] || '#F59E0B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>
    </Grid>
  );
};

export default ChartsSection;
