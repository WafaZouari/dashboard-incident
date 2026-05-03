import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Tabs, Tab,
  Chip, Breadcrumbs, Link, List, ListItem,
  CircularProgress, Dialog, DialogTitle, DialogContent, Alert, alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SecurityIcon from '@mui/icons-material/Security';
import FactoryIcon from '@mui/icons-material/Factory';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentApi } from '../services/api';
import { StatusChip, SeverityBadge } from '../components/common/StatusChip';
import AIInvestigationPanel from '../components/investigations/AIInvestigationPanel';
import IncidentForm from '../components/incidents/IncidentForm';
import type { Incident } from '../types';

const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
    {icon && <Box sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }}>{icon}</Box>}
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>{label}</Typography>
      <Box sx={{ mt: 0.25 }}>{typeof value === 'string' ? <Typography variant="body2" sx={{ fontWeight: 500 }}>{value || '—'}</Typography> : value}</Box>
    </Box>
  </Box>
);

const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  const fetchIncident = async () => {
    try {
      const res = await incidentApi.getById(Number(id));
      setIncident(res.data.data);
    } catch {
      navigate('/incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncident(); }, [id]);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this incident? This action cannot be undone.')) return;
    try {
      await incidentApi.delete(Number(id));
      navigate('/incidents');
    } catch (err) {
      alert('Failed to delete incident');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  if (!incident) return null;

  return (
    <Box>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="#" onClick={() => navigate('/dashboard')} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Dashboard</Link>
        <Link href="#" onClick={() => navigate('/incidents')} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Incidents</Link>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.primary' }}>{incident.incidentNo}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{incident.incidentNo}</Typography>
            {incident.investigationDone && (
              <Chip label="INVESTIGATED" size="small" sx={{ background: alpha('#10B981', 0.15), color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700, fontSize: '0.7rem' }} />
            )}
            {incident.pearClass && (
              <Chip label={incident.pearClass} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <StatusChip status={incident.status} />
            <SeverityBadge severity={incident.actualSeverity} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')}>Back</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>Delete</Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>Edit</Button>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        {/* Main content */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                <Tab label="Details" />
                <Tab label={`Investigations (${incident.investigations?.length || 0})`} />
                <Tab label={`Action Items (${incident.actionItems?.length || 0})`} />
                <Tab label={`Attachments (${incident.attachments?.length || 0})`} />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {tab === 0 && (
                <Grid container spacing={2.5}>
                  {/* Brief Description */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>Brief Description</Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary', mt: 0.5 }}>
                      {incident.briefDescription || 'No description provided.'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="Incident No." value={incident.incidentNo} />
                    <InfoRow label="Source Year" value={String(incident.sourceYear || '—')} />
                    <InfoRow label="Date / Time Occurred" value={incident.dateTimeOccurred ? new Date(incident.dateTimeOccurred).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : '—'} icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Site" value={incident.site || '—'} icon={<PlaceIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Location on Site" value={incident.locationOnSite || '—'} icon={<PlaceIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Reported By" value={incident.reportedBy || '—'} icon={<PersonIcon sx={{ fontSize: 16 }} />} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="PEAR Class" value={incident.pearClass || '—'} icon={<CategoryIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Sub Category" value={incident.subCategory || '—'} />
                    <InfoRow label="Inc. Type if Injury" value={incident.incTypeIfInjury || '—'} />
                    <InfoRow label="Asset Integrity Type" value={incident.assetIntegrityType || '—'} icon={<FactoryIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Damaged Zone" value={incident.damagedZone || '—'} />
                    <InfoRow label="PSE Tiers" value={incident.pseTiers || '—'} icon={<SecurityIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Actual Severity" value={<SeverityBadge severity={incident.actualSeverity} />} />
                    <InfoRow label="Potential Severity" value={<SeverityBadge severity={incident.potentialSeverity} />} />
                    <InfoRow label="Investigation Done" value={incident.investigationDone ? 'Yes' : 'No'} />
                  </Grid>
                </Grid>
              )}

              {tab === 1 && (
                <Box>
                  {!incident.investigations?.length ? (
                    <Alert severity="info">No investigations yet. Use the AI panel to create one automatically.</Alert>
                  ) : (
                    <List>
                      {incident.investigations.map((inv) => (
                        <ListItem key={inv.id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>Investigation #{inv.id}</Typography>
                            <StatusChip status={inv.status} />
                          </Box>
                          {inv.immediateCauses && <Typography variant="body2" sx={{ color: 'text.secondary' }}><strong>Immediate Causes:</strong> {inv.immediateCauses}</Typography>}
                          {inv.rootCauses && <Typography variant="body2" sx={{ color: 'text.secondary' }}><strong>Root Causes:</strong> {inv.rootCauses}</Typography>}
                          {inv.recommendations && <Typography variant="body2" sx={{ color: 'text.secondary' }}><strong>Recommendations:</strong> {inv.recommendations}</Typography>}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  {!incident.actionItems?.length ? (
                    <Alert severity="info">No action items yet.</Alert>
                  ) : (
                    <List>
                      {incident.actionItems.map((item) => (
                        <ListItem key={item.id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>Action Item #{item.id}</Typography>
                            <StatusChip status={item.status} />
                          </Box>
                          {item.correctiveActionsTaken && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              <strong>Corrective Actions Taken:</strong> {item.correctiveActionsTaken}
                            </Typography>
                          )}
                          {item.suggestionsRecommendations && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              <strong>Suggestions / Recommendations:</strong> {item.suggestionsRecommendations}
                            </Typography>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {tab === 3 && (
                <Alert severity="info">File attachment upload coming soon.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <AIInvestigationPanel incidentId={incident.id} onInvestigationCreated={fetchIncident} />
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Incident</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <IncidentForm incidentId={incident.id} onSuccess={() => { setEditOpen(false); fetchIncident(); }} onCancel={() => setEditOpen(false)} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default IncidentDetail;
