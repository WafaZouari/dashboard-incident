import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Skeleton,
  Grid,
} from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import KPICard from '../components/dashboard/KPICard';
import ChartsSection from '../components/dashboard/ChartsSection';
import IncidentTable from '../components/incidents/IncidentTable';
import type { DashboardStats, LocationDataPoint, SeverityDataPoint, TrendDataPoint, TypeDataPoint } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [byType, setByType] = useState<TypeDataPoint[]>([]);
  const [byLocation, setByLocation] = useState<LocationDataPoint[]>([]);
  const [bySeverity, setBySeverity] = useState<SeverityDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, trendsRes, typeRes, locRes, sevRes] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getTrends(12),
          analyticsApi.getByType(),
          analyticsApi.getByLocation(),
          analyticsApi.getBySeverity(),
        ]);
        setStats(statsRes.data.data);
        setTrends(trendsRes.data.data);
        setByType(typeRes.data.data);
        setByLocation(locRes.data.data);
        setBySeverity(sevRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const kpiCards = stats ? [
    { title: 'Total Incidents', value: stats.totalIncidents, icon: <ReportIcon sx={{ fontSize: 20 }} />, color: '#06B6D4', subtitle: 'All time', change: stats.changePercent },
    { title: 'Open Incidents', value: stats.openIncidents, icon: <WarningIcon sx={{ fontSize: 20 }} />, color: '#EF4444', subtitle: 'Requires action', onClick: () => navigate('/incidents?status=open') },
    { title: 'Investigated', value: `${stats.investigationRate}%`, icon: <SearchIcon sx={{ fontSize: 20 }} />, color: '#F59E0B', subtitle: `${stats.withInvestigation} of ${stats.totalIncidents}` },
    { title: 'Avg. Severity', value: stats.avgSeverity, icon: <TrendingUpIcon sx={{ fontSize: 20 }} />, color: '#8B5CF6', subtitle: 'Average severity score' },
  ] : [];

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
            }}
          >
            Dashboard
          </Typography>

        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/incidents/new')}
          sx={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
        >
          New Incident
        </Button>
      </Box>

      {/* LTIFR Hero Banner */}
      {/* LTIFR Hero Banner */}
      {!loading && stats && (
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(239,68,68,0.3)',
            position: 'relative',
            overflow: 'hidden',
            gap: 3
          }}
        >
          {/* LEFT SIDE */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              gap: 1,
              zIndex: 1,
              maxWidth: 460
            }}
          >
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ fontSize: 26, opacity: 0.9 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                LTIFR
              </Typography>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: '0.92rem',
                lineHeight: 1.5
              }}
            >
              Lost Time Injury Frequency Rate
            </Typography>

            {/* Formula (styled like a badge) */}
            <Box
              sx={{
                mt: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                background: 'rgba(255,255,255,0.15)',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                letterSpacing: '0.02em'
              }}
            >
              (LTI × 1,000,000) / Hours Worked
            </Box>
          </Box>

          {/* RIGHT SIDE VALUE */}
          <Box sx={{ textAlign: 'right', zIndex: 1 }}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.85, display: 'block', mb: 0.5 }}
            >
              Current Rate
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                lineHeight: 1,
                textShadow: '0 3px 12px rgba(0,0,0,0.2)'
              }}
            >
              {stats.ltifr.toFixed(2)}
            </Typography>
          </Box>

          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              right: -30,
              top: -50,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: 90,
              bottom: -60,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)'
            }}
          />
        </Box>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4, alignItems: "stretch" }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
            <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
          </Grid>
        )) : kpiCards.map((card, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
            <KPICard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      {!loading && (
        <Box sx={{ mb: 3 }}>
          <ChartsSection
            trends={trends}
            byType={byType}
            byLocation={byLocation}
            bySeverity={bySeverity}
          />
        </Box>
      )}

      {/* Recent Incidents */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 3, height: 20, borderRadius: 2, background: '#F59E0B' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Recent Incidents</Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => navigate('/incidents')}>View All</Button>
        </Box>
        <IncidentTable />
      </Box>
    </Box>
  );
};

export default Dashboard;
