import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Tabs, Tab,
  Chip, Breadcrumbs, Link, List, ListItem, ListItemText,
  CircularProgress, Dialog, DialogTitle, DialogContent, Alert, alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  if (!incident) return null;

  return (
    <Box>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="#" onClick={() => navigate('/dashboard')} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Dashboard</Link>
        <Link href="#" onClick={() => navigate('/incidents')} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Incidents</Link>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.primary' }}>{incident.incidentId || `#${incident.id}`}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{incident.title}</Typography>
            {incident.isHighPotential && (
              <Chip label="HIGH POTENTIAL" size="small" sx={{ background: alpha('#EF4444', 0.15), color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 700, fontSize: '0.7rem' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <StatusChip status={incident.status} />
            <SeverityBadge severity={incident.actualSeverity} />
            <Chip label={incident.incidentId || `ID: ${incident.id}`} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')}>Back</Button>
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
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                      {incident.description || 'No description provided.'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="Date Occurred" value={new Date(incident.dateOccurred).toLocaleDateString('en-US', { dateStyle: 'full' })} icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Location" value={incident.location?.name || '—'} icon={<PlaceIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Incident Type" value={incident.incidentType?.name || '—'} icon={<CategoryIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Consequence" value={incident.consequence?.name || '—'} />
                    <InfoRow label="Actual Severity" value={<SeverityBadge severity={incident.actualSeverity} />} />
                    <InfoRow label="Potential Severity" value={<SeverityBadge severity={incident.potentialSeverity} />} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="Reported By" value={incident.reportedBy ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}` : '—'} icon={<PersonIcon sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Supervisor" value={incident.responsibleSupervisor ? `${incident.responsibleSupervisor.firstName} ${incident.responsibleSupervisor.lastName}` : '—'} />
                    <InfoRow label="Incident Leader" value={incident.incidentLeader ? `${incident.incidentLeader.firstName} ${incident.incidentLeader.lastName}` : '—'} />
                    <InfoRow label="Status" value={<StatusChip status={incident.status} />} />
                    <InfoRow label="Has Investigation" value={incident.hasInvestigation ? 'Yes' : 'No'} />
                    <InfoRow label="Created" value={incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : '—'} />
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
                        <ListItem key={inv.id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>Investigation #{inv.id}</Typography>
                            <StatusChip status={inv.status} />
                          </Box>
                          {inv.rootCause && <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}><strong>Root Cause:</strong> {inv.rootCause}</Typography>}
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
                        <ListItem key={item.id} divider>
                          <ListItemText
                            primary={item.description}
                            secondary={`Priority: ${item.priority} | Due: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'} | Assigned: ${item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : 'Unassigned'}`}
                          />
                          <StatusChip status={item.status} />
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
