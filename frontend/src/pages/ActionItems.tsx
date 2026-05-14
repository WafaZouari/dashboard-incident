import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip,
  CircularProgress, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Select, MenuItem, FormControl, alpha, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Divider, Button,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { actionItemApi } from '../services/api.ts';
import { StatusChip } from '../components/common/StatusChip.tsx';
import type { ActionItem } from '../types/actionItems.ts';
import useResponsive from '../hooks/useResponsive.ts';

const ActionItems: React.FC = () => {
  const { downSm, downMd } = useResponsive();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [overdue, setOverdue] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [editForm, setEditForm] = useState({
    correctiveActionsTaken: '',
    suggestionsRecommendations: '',
  });

  const fetchData = async () => {
    try {
      const [allRes, overdueRes] = await Promise.all([
        actionItemApi.getAll({ limit: 50 }),
        actionItemApi.getOverdue(),
      ]);
      setItems(allRes.data.data);
      setOverdue(overdueRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await actionItemApi.updateStatus(id, status);
      fetchData();
    } catch { }
  };
  
  const handleEditOpen = (item: ActionItem) => {
    setEditingItem(item);
    setEditForm({
      correctiveActionsTaken: item.correctiveActionsTaken || '',
      suggestionsRecommendations: item.suggestionsRecommendations || '',
    });
  };

  const handleEditSave = async () => {
    if (!editingItem) return;
    try {
      await actionItemApi.update(editingItem.id, editForm);
      setEditingItem(null);
      fetchData();
    } catch { }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>

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
            color: 'text.primary',
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
            lineHeight: 1.2,
            mb: 2,
          }}
        >
          Action Items
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 0.5,
            lineHeight: 1.4,
            textAlign: 'left',
            mb: 1,
          }}
        >
          Track corrective actions and suggestions from Excel imports
        </Typography>
      </Box>
      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <Card sx={{ mb: 3, border: '1px solid rgba(239,68,68,0.3)', background: alpha('#EF4444', 0.04) }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WarningIcon sx={{ color: '#EF4444', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#EF4444' }}>
                {overdue.length} Overdue Action Items
              </Typography>
            </Box>
            {overdue.slice(0, 3).map((item) => (
              <Typography key={item.id} variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.25 }}>
                • {item.correctiveActionsTaken || item.suggestionsRecommendations || `Item #${item.id}`} (Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'})
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: items.length, color: '#94A3B8' },
          { label: 'Pending', value: items.filter((i) => i.status === 'pending').length, color: '#F59E0B' },
          { label: 'In Progress', value: items.filter((i) => i.status === 'in_progress').length, color: '#06B6D4' },
          { label: 'Completed', value: items.filter((i) => i.status === 'completed').length, color: '#10B981' },
          { label: 'Overdue', value: overdue.length, color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <Chip
            key={label}
            label={`${label}: ${value}`}
            sx={{ background: alpha(color, 0.1), color, border: `1px solid ${alpha(color, 0.2)}`, fontWeight: 600 }}
          />
        ))}
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action / Corrective Measures</TableCell>
                {!downMd && <TableCell>Suggestions</TableCell>}
                {!downSm && <TableCell>Incident</TableCell>}
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No action items found</TableCell></TableRow>
              ) : items.map((item) => {
                const isOverdueItem = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'completed';
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, maxWidth: downMd ? 200 : 300 }} noWrap>
                          {item.correctiveActionsTaken || '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Assigned: {item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : 'Unassigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                    {!downMd && (
                      <TableCell>
                        <Typography sx={{ fontSize: '0.78rem', maxWidth: 200 }} noWrap>
                          {item.suggestionsRecommendations || '—'}
                        </Typography>
                      </TableCell>
                    )}
                    {!downSm && (
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', color: 'primary.main', fontFamily: 'monospace' }}>
                          {item.incident?.incidentNo || `INC-${item.incidentId}`}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem', color: isOverdueItem ? '#EF4444' : 'text.secondary', fontWeight: isOverdueItem ? 700 : 400 }}>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusChip status={item.status} /></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, alignItems: 'center' }}>
                        {!downMd && (
                          <>
                            <Tooltip title="Accept">
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleStatusChange(item.id, 'accepted')}
                                sx={{ '&:hover': { background: alpha('#10B981', 0.1) } }}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Refuse">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleStatusChange(item.id, 'refused')}
                                sx={{ '&:hover': { background: alpha('#EF4444', 0.1) } }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />
                          </>
                        )}
                        <Tooltip title="Edit Details">
                          <IconButton size="small" onClick={() => handleEditOpen(item)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <FormControl size="small" sx={{ minWidth: downSm ? 80 : 100, ml: 1 }}>
                          <Select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            sx={{ fontSize: '0.7rem', height: 28 }}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="accepted">Accepted</MenuItem>
                            <MenuItem value="refused">Refused</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingItem)} onClose={() => setEditingItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Action Item</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Corrective Actions Taken"
              multiline
              rows={3}
              fullWidth
              value={editForm.correctiveActionsTaken}
              onChange={(e) => setEditForm({ ...editForm, correctiveActionsTaken: e.target.value })}
            />
            <TextField
              label="Suggestions / Recommendations"
              multiline
              rows={3}
              fullWidth
              value={editForm.suggestionsRecommendations}
              onChange={(e) => setEditForm({ ...editForm, suggestionsRecommendations: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditingItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActionItems;
