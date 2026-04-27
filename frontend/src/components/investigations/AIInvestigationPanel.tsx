import React, { useState } from 'react';
import {
  Box, Card, CardContent, Button, Typography, CircularProgress,
  Alert, Chip, List, ListItem, ListItemText, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress, alpha,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ShieldIcon from '@mui/icons-material/Shield';
import { aiApi } from '../../services/api';
import type { AIAnalysisResult, AISimilarIncident } from '../../types';
//import { AIAnalysisResult, AISimilarIncident } from '../../types';

interface AIInvestigationPanelProps {
  incidentId: number;
  onInvestigationCreated?: () => void;
}

const riskConfig: Record<string, { color: string; label: string }> = {
  low: { color: '#10B981', label: 'LOW RISK' },
  medium: { color: '#F59E0B', label: 'MEDIUM RISK' },
  high: { color: '#F97316', label: 'HIGH RISK' },
  critical: { color: '#EF4444', label: 'CRITICAL RISK' },
};

const AIInvestigationPanel: React.FC<AIInvestigationPanelProps> = ({ incidentId, onInvestigationCreated }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [similar, setSimilar] = useState<AISimilarIncident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await aiApi.analyzeIncident(incidentId);
      setAnalysis(res.data.data.analysis);
      setSimilar(res.data.data.similarIncidents || []);
      setDialogOpen(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'AI analysis failed. Check your ANTHROPIC_API_KEY.');
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
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Powered by Claude AI</Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.8rem', lineHeight: 1.6 }}>
            Use Claude AI to automatically analyze this incident, identify root causes, and generate an investigation report with prioritized action items.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }} icon={<CheckCircleIcon />}>
              AI investigation created successfully with action items!
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleAnalyze}
            disabled={analyzing || success}
            startIcon={analyzing ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
              '&:hover': { boxShadow: '0 6px 24px rgba(139,92,246,0.4)' },
            }}
          >
            {analyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
          </Button>

          {analyzing && <LinearProgress sx={{ mt: 1, borderRadius: 2, background: alpha('#8B5CF6', 0.2), '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' } }} />}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: '#8B5CF6' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Investigation Analysis</Typography>
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
            <Box sx={{ p: 2.5 }}>
              {/* Root Cause */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PsychologyIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B5CF6' }}>Root Cause Analysis</Typography>
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.primary', background: alpha('#8B5CF6', 0.05), p: 1.5, borderRadius: 1, border: `1px solid ${alpha('#8B5CF6', 0.1)}` }}>
                  {analysis.rootCauseAnalysis}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'divider', mb: 2 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                {/* Contributing Factors */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WarningAmberIcon sx={{ fontSize: 16, color: '#F97316' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F97316', fontSize: '0.8rem' }}>Contributing Factors</Typography>
                  </Box>
                  <List dense sx={{ p: 0 }}>
                    {analysis.contributingFactors.map((f, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.25 }}>
                        <ListItemText primary={f} slotProps={{ primary: { sx: { fontSize: '0.78rem' } } }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Preventive Measures */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ShieldIcon sx={{ fontSize: 16, color: '#10B981' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10B981', fontSize: '0.8rem' }}>Preventive Measures</Typography>
                  </Box>
                  <List dense sx={{ p: 0 }}>
                    {analysis.preventiveMeasures.map((m, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.25 }}>
                        <ListItemText primary={m} slotProps={{ primary: { sx: { fontSize: '0.78rem' } } }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>

              {/* Recommendations */}
              <Box sx={{ mb: similar.length > 0 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LightbulbIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F59E0B', fontSize: '0.8rem' }}>Recommendations</Typography>
                </Box>
                <List dense sx={{ p: 0 }}>
                  {analysis.recommendations.map((r, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 0.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                        <strong>{i + 1}.</strong> {r}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Similar incidents */}
              {similar.length > 0 && (
                <Box sx={{ mt: 2, p: 1.5, background: alpha('#06B6D4', 0.05), borderRadius: 1, border: `1px solid ${alpha('#06B6D4', 0.1)}` }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#06B6D4', mb: 1 }}>
                    Similar Historical Incidents
                  </Typography>
                  {similar.map((s) => (
                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={`${s.similarityScore}%`} size="small" sx={{ fontSize: '0.7rem', background: alpha('#06B6D4', 0.15), color: '#06B6D4' }} />
                      <Typography variant="caption">{s.reason}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleCreateInvestigation}
            disabled={creating}
            startIcon={creating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            sx={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
          >
            {creating ? 'Creating...' : 'Create Investigation & Action Items'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIInvestigationPanel;
