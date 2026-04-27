import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  CircularProgress, alpha, Chip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { analyticsApi, aiApi } from '../services/api';
import ChartsSection from '../components/dashboard/ChartsSection';
import type { LocationDataPoint, SeverityDataPoint, TrendDataPoint, TypeDataPoint } from '../types';

const Analytics: React.FC = () => {
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [byType, setByType] = useState<TypeDataPoint[]>([]);
  const [byLocation, setByLocation] = useState<LocationDataPoint[]>([]);
  const [bySeverity, setBySeverity] = useState<SeverityDataPoint[]>([]);
  const [insights, setInsights] = useState<{ trends: string[]; hotspots: string[]; recommendations: string[] } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendsRes, typeRes, locRes, sevRes] = await Promise.all([
          analyticsApi.getTrends(12),
          analyticsApi.getByType(),
          analyticsApi.getByLocation(),
          analyticsApi.getBySeverity(),
        ]);
        setTrends(trendsRes.data.data);
        setByType(typeRes.data.data);
        setByLocation(locRes.data.data);
        setBySeverity(sevRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await aiApi.getInsights();
      setInsights(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e?.response?.data?.message || 'AI insights failed');
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
          }}
        >
          Analytics
        </Typography>
        <Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Incident trends and statistical analysis</Typography>

        </Box>
        <Button
          variant="contained"
          startIcon={loadingInsights ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
          onClick={handleGetInsights}
          disabled={loadingInsights}
          sx={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
        >
          {loadingInsights ? 'Getting Insights...' : 'AI Insights'}
        </Button>
      </Box>

      {insights && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { title: 'Trends', items: insights.trends, color: '#06B6D4' },
            { title: 'Hotspots', items: insights.hotspots, color: '#EF4444' },
            { title: 'Strategic Recommendations', items: insights.recommendations, color: '#10B981' },
          ].map(({ title, items, color }) => (
            <Grid size={{ xs: 12, md: 4 }} key={title}>
              <Card sx={{ border: `1px solid ${alpha(color, 0.3)}`, background: alpha(color, 0.04) }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 16, color }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>{title}</Typography>
                  </Box>
                  {items.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
                      <Chip label={i + 1} size="small" sx={{ minWidth: 20, height: 18, fontSize: '0.65rem', background: alpha(color, 0.15), color, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ lineHeight: 1.5, color: 'text.primary' }}>{item}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ChartsSection trends={trends} byType={byType} byLocation={byLocation} bySeverity={bySeverity} />
    </Box>
  );
};

export default Analytics;
