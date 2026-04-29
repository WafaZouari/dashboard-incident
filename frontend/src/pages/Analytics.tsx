import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  CircularProgress, alpha, Chip, MenuItem, Select,
  FormControl, InputLabel, Snackbar, Alert, Tooltip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterListIcon from '@mui/icons-material/FilterList';
import { analyticsApi, aiApi, importApi } from '../services/api';
import ChartsSection from '../components/dashboard/ChartsSection';
import RootCauseVisualization from '../components/analytics/RootCauseVisualization';
import type { LocationDataPoint, SeverityDataPoint, TrendDataPoint, TypeDataPoint, AIRootCauseAnalysis } from '../types';

const YEARS = Array.from({ length: 2025 - 2023 }, (_, i) => 2025 - i); // 2025 down to 2012

const Analytics: React.FC = () => {
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [byType, setByType] = useState<TypeDataPoint[]>([]);
  const [byLocation, setByLocation] = useState<LocationDataPoint[]>([]);
  const [bySeverity, setBySeverity] = useState<SeverityDataPoint[]>([]);
  const [insights, setInsights] = useState<{ trends: string[]; hotspots: string[]; recommendations: string[] } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<AIRootCauseAnalysis | null>(null);
  const [loadingRCA, setLoadingRCA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ltifr, setLtifr] = useState<number | null>(null);

  const fetchAll = async (year?: string) => {
    setLoading(true);
    try {
      const [trendsRes, typeRes, locRes, sevRes, dashboardRes] = await Promise.all([
        analyticsApi.getTrends(12, year),
        analyticsApi.getByType(year),
        analyticsApi.getByLocation(year),
        analyticsApi.getBySeverity(year),
        analyticsApi.getDashboard(year),
      ]);
      setTrends(trendsRes.data.data);
      setByType(typeRes.data.data);
      setByLocation(locRes.data.data);
      setBySeverity(sevRes.data.data);
      setLtifr(dashboardRes.data.data.ltifr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(selectedYear);
  }, [selectedYear]);

  const handleYearChange = (e: SelectChangeEvent) => {
    setSelectedYear(e.target.value);
  };

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

  const handleGetRCA = async () => {
    setLoadingRCA(true);
    try {
      const res = await aiApi.getRootCauseAnalysis(selectedYear);
      setRootCauseAnalysis(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Root Cause Analysis failed', severity: 'error' });
    } finally {
      setLoadingRCA(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const res = await importApi.uploadExcel(file);
      const count = res.data.data?.count ?? 0;
      setSnackbar({ open: true, message: `✅ Successfully imported ${count} incidents!`, severity: 'success' });
      fetchAll(selectedYear); // refresh charts
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Import failed. Check file format.', severity: 'error' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            m: 0,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
              lineHeight: 1.2, // 🔥 tighter alignment
              mb: 0,           // remove bottom spacing
            }}
          >
            Analytics
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              lineHeight: 1.4,
            }}
          >
            Incident trends and statistical analysis
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Year filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="year-filter-label">
              <FilterListIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Year
            </InputLabel>
            <Select
              labelId="year-filter-label"
              id="year-filter-select"
              value={selectedYear}
              label="Year"
              onChange={handleYearChange}
            >
              <MenuItem value="all">All Years</MenuItem>
              {YEARS.map((y) => (
                <MenuItem key={y} value={String(y)}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Import Excel button */}
          <Tooltip title="Upload an Excel file (.xlsx) to import incidents">
            <Button
              id="import-excel-btn"
              variant="outlined"
              startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
              onClick={handleImportClick}
              disabled={importing}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': { background: (t) => alpha(t.palette.primary.main, 0.08) },
              }}
            >
              {importing ? 'Importing...' : 'Import Data'}
            </Button>
          </Tooltip>

          {/* AI Insights button */}
          <Button
            id="ai-insights-btn"
            variant="contained"
            startIcon={loadingInsights ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleGetInsights}
            disabled={loadingInsights}
            sx={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
          >
            {loadingInsights ? 'Getting Insights...' : 'AI Insights'}
          </Button>

          {/* Root Cause Analysis button */}
          <Button
            id="ai-rca-btn"
            variant="contained"
            startIcon={loadingRCA ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleGetRCA}
            disabled={loadingRCA}
            sx={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}
          >
            {loadingRCA ? 'Analyzing RCA...' : 'Root Cause Analysis'}
          </Button>
        </Box>
      </Box>

      {/* AI Insights cards */}
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

      {/* Root Cause Analysis Visuals */}
      {rootCauseAnalysis && (
        <RootCauseVisualization data={rootCauseAnalysis} />
      )}

      {/* LTIFR Secondary Metric */}
      {!loading && ltifr !== null && (
        <Box sx={{ mb: 3 }}>
          <Card
            sx={{
              minWidth: 300,
              borderRadius: 3,
              background: alpha('#EF4444', 0.06),
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 6px 18px rgba(239,68,68,0.15)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(239,68,68,0.25)'
              }
            }}
          >
            <CardContent
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {/* LEFT TEXT */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>

                <Typography
                  variant="caption"
                  sx={{
                    display: 'flex',
                    alignItems: 'start',
                    fontWeight: 700,
                    color: '#EF4444',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  LTIFR
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    lineHeight: 1.4
                  }}
                >
                  Lost Time Injury Frequency Rate
                </Typography>

                {/* Small formula badge */}
                <Box
                  sx={{
                    mt: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    background: 'rgba(239,68,68,0.12)',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace'
                  }}
                >
                  (LTI × 1M) / Hours
                </Box>

              </Box>

              {/* RIGHT VALUE */}
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  Current
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: '#EF4444',
                    lineHeight: 1
                  }}
                >
                  {ltifr.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Charts */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ChartsSection trends={trends} byType={byType} byLocation={byLocation} bySeverity={bySeverity} />
      )}

      {/* Snackbar notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Analytics;
