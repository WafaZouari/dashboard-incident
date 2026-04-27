import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  CircularProgress, Alert, alpha,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import { investigationApi } from '../services/api';

import { StatusChip } from '../components/common/StatusChip';
import type { Investigation } from '../types';

const Investigations: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    investigationApi.getAll({ limit: 50 })
      .then((res) => setInvestigations(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusGroups = {
    pending: investigations.filter((i) => i.status === 'pending'),
    in_progress: investigations.filter((i) => i.status === 'in_progress'),
    completed: investigations.filter((i) => i.status === 'completed'),
  };

  const columnConfig = [
    { key: 'pending', label: 'Pending', color: '#F59E0B' },
    { key: 'in_progress', label: 'In Progress', color: '#06B6D4' },
    { key: 'completed', label: 'Completed', color: '#10B981' },
  ] as const;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
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
            Investigations
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Track investigation status and findings
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" icon={<SearchIcon />} sx={{ mb: 3 }}>
        Tip: To create an AI-powered investigation, go to any Incident's detail page and click "Analyze with AI".
      </Alert>

      {/* Kanban board */}
      <Grid container spacing={2}>
        {columnConfig.map(({ key, label, color }) => (
          <Grid size={{ xs: 12, md: 4 }} key={key}>
            <Box sx={{
              background: alpha(color, 0.06),
              border: `1px solid ${alpha(color, 0.2)}`,
              borderRadius: 2, minHeight: 400, p: 1.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>{label}</Typography>
                <Chip label={statusGroups[key].length} size="small" sx={{ ml: 'auto', height: 20, fontSize: '0.7rem', background: alpha(color, 0.15), color }} />
              </Box>

              {statusGroups[key].length === 0 ? (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 4 }}>
                  No investigations
                </Typography>
              ) : statusGroups[key].map((inv) => (
                <Card key={inv.id} sx={{ mb: 1.5, cursor: 'pointer', '&:hover': { transform: 'translateY(-1px)' } }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                      INV-{inv.id} | {inv.incident?.incidentId || `INC-${inv.incidentId}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', mt: 0.25, mb: 1 }} noWrap>
                      {inv.incident?.title || 'Investigation'}
                    </Typography>
                    {inv.rootCause && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }} noWrap>
                        {inv.rootCause}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusChip status={inv.status} />
                      {inv.investigationDate && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {new Date(inv.investigationDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Investigations;
