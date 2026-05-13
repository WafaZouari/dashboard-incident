import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Button, Typography, CircularProgress,
  Alert, Chip, List, ListItem, ListItemText, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress, alpha,
  Grid, Paper,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShieldIcon from '@mui/icons-material/Shield';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InsightIcon from '@mui/icons-material/Troubleshoot';
import { aiApi } from '../../services/api';
import type { AIAnalysisResult, AISimilarIncident } from '../../types';
import RootCauseVisualization from '../analytics/RootCauseVisualization';

interface AIInvestigationPanelProps {
  incidentId: number;
  existingAnalysis?: any;
  onInvestigationCreated?: () => void;
}

const riskConfig: Record<string, { color: string; label: string }> = {
  low: { color: '#10B981', label: 'LOW RISK' },
  medium: { color: '#F59E0B', label: 'MEDIUM RISK' },
  high: { color: '#F97316', label: 'HIGH RISK' },
  critical: { color: '#EF4444', label: 'CRITICAL RISK' },
};

const AIInvestigationPanel: React.FC<AIInvestigationPanelProps> = ({ incidentId, existingAnalysis, onInvestigationCreated }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [similar, setSimilar] = useState<AISimilarIncident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (existingAnalysis?.analysis) {
      setAnalysis(existingAnalysis.analysis as AIAnalysisResult);
    }
  }, [existingAnalysis]);

  const handleAnalyze = async (refresh = false) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await aiApi.analyzeIncident(incidentId, refresh);
      setAnalysis(res.data.data.analysis);
      setSimilar(res.data.data.similarIncidents || []);
      setDialogOpen(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateInvestigation = async () => {
    setCreating(true);
    try {
      await aiApi.createInvestigation(incidentId);
      setSuccess(true);
      setDialogOpen(false);
      onInvestigationCreated?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to create investigation');
    } finally {
      setCreating(false);
    }
  };

  const risk = analysis ? riskConfig[analysis.riskLevel] : null;

  return (
    <>
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.06) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PsychologyIcon sx={{ fontSize: 22, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>AI Investigation</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Powered by Gemini 1.5 Pro</Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.8rem', lineHeight: 1.6 }}>
            Use AI to automatically analyze this incident, identify root causes (Ishikawa & 5 Whys), and generate deep safety insights.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }} icon={<CheckCircleIcon />}>
              AI investigation created successfully!
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {!analysis ? (
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleAnalyze(false)}
                disabled={analyzing}
                startIcon={analyzing ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                  boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                }}
              >
                {analyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setDialogOpen(true)}
                  startIcon={<InsightIcon />}
                  sx={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                >
                  View AI Insights
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setDialogOpen(true)}
                  startIcon={<AccountTreeIcon />}
                  sx={{ color: '#8B5CF6', borderColor: '#8B5CF6' }}
                >
                  View Root Causes
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleAnalyze(true)}
                  disabled={analyzing}
                  sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
                >
                  {analyzing ? 'Refreshing...' : 'Re-generate Analysis'}
                </Button>
              </>
            )}
          </Box>

          {analyzing && <LinearProgress sx={{ mt: 1, borderRadius: 2, background: alpha('#8B5CF6', 0.2), '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' } }} />}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: '#8B5CF6' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Advanced Investigation Report</Typography>
            </Box>
            {risk && (
              <Chip
                label={risk.label}
                sx={{
                  background: alpha(risk.color, 0.15), color: risk.color,
                  border: `1px solid ${alpha(risk.color, 0.3)}`, fontWeight: 700, fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {analysis && (
            <Box sx={{ p: 3 }}>
              {/* Summary Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon color="primary" /> Executive Summary
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.primary', p: 2, background: alpha('#8B5CF6', 0.03), borderRadius: 2, border: '1px solid', borderColor: alpha('#8B5CF6', 0.1) }}>
                  {analysis.rootCauseAnalysis}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#F97316' }}>
                    <WarningAmberIcon fontSize="small" /> Contributing Factors
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, background: alpha('#F97316', 0.02) }}>
                    <List dense disablePadding>
                      {analysis.contributingFactors.map((f, i) => (
                        <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText primary={f} slotProps={{ primary: { sx: { fontSize: '0.8rem' } } }} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#10B981' }}>
                    <ShieldIcon fontSize="small" /> Preventive Measures
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, background: alpha('#10B981', 0.02) }}>
                    <List dense disablePadding>
                      {analysis.preventiveMeasures.map((m, i) => (
                        <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText primary={m} slotProps={{ primary: { sx: { fontSize: '0.8rem' } } }} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Ishikawa & 5 Whys */}
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Root Cause Methodologies</Typography>
              <RootCauseVisualization data={{ ishikawa: analysis.ishikawa, fiveWhys: analysis.fiveWhys }} />

              <Divider sx={{ my: 4 }} />

              {/* Deep Insights */}
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>AI Deep Insights</Typography>
              <Grid container spacing={3}>
                {[
                  { title: 'Immediate Risks', items: analysis.insights.immediateRisks, color: '#EF4444' },
                  { title: 'Long-term Implications', items: analysis.insights.longTermImplications, color: '#8B5CF6' },
                  { title: 'Safety Culture Insights', items: analysis.insights.safetyCulture, color: '#06B6D4' },
                ].map((section, idx) => (
                  <Grid size={{ xs: 12, md: 4 }} key={idx}>
                    <Card sx={{ height: '100%', border: `1px solid ${alpha(section.color, 0.3)}`, background: alpha(section.color, 0.03) }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: section.color, mb: 1.5, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          {section.title}
                        </Typography>
                        <List dense disablePadding>
                          {section.items.map((item, i) => (
                            <ListItem key={i} sx={{ px: 0, py: 0.5, alignItems: 'flex-start' }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: section.color, mt: 0.8, mr: 1.5, flexShrink: 0 }} />
                              <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.5 }}>{item}</Typography>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Similar incidents */}
              {similar.length > 0 && (
                <Box sx={{ mt: 4, p: 2, background: alpha('#06B6D4', 0.05), borderRadius: 2, border: `1px solid ${alpha('#06B6D4', 0.1)}` }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#06B6D4', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountTreeIcon fontSize="small" /> Similar Historical Incidents
                  </Typography>
                  <Grid container spacing={2}>
                    {similar.map((s) => (
                      <Grid size={{ xs: 12, sm: 4 }} key={s.id}>
                        <Box sx={{ p: 1.5, background: '#fff', borderRadius: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip label={`${s.similarityScore}% Match`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, background: alpha('#06B6D4', 0.1), color: '#06B6D4' }} />
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.4 }}>"{s.reason}"</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
          <Button
            variant="contained"
            onClick={handleCreateInvestigation}
            disabled={creating}
            startIcon={creating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            sx={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', borderRadius: 2, px: 3 }}
          >
            {creating ? 'Creating...' : 'Create Official Investigation'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIInvestigationPanel;
