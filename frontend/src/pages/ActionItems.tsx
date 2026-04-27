import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button,
  CircularProgress, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Select, MenuItem, FormControl, alpha,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { actionItemApi } from '../services/api.ts';
//import { ActionItem } from '../types.ts';
import { StatusChip } from '../components/common/StatusChip.tsx';
import type { ActionItem } from '../types/actionItems.ts';

const ActionItems: React.FC = () => {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [overdue, setOverdue] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const priorityColor: Record<string, string> = {
    low: '#10B981', medium: '#F59E0B', high: '#F97316', critical: '#EF4444',
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Action Items</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Track corrective and preventive actions</Typography>
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
                • {item.description} (Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'})
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
                <TableCell>Description</TableCell>
                <TableCell>Incident</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
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
                      <Typography sx={{ fontSize: '0.8rem', maxWidth: 280 }} noWrap>{item.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem', color: 'primary.main', fontFamily: 'monospace' }}>
                        {item.incident?.incidentId || `INC-${item.incidentId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.priority.toUpperCase()}
                        size="small"
                        sx={{
                          background: alpha(priorityColor[item.priority] || '#94A3B8', 0.12),
                          color: priorityColor[item.priority] || '#94A3B8',
                          fontSize: '0.65rem', fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem' }}>
                        {item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem', color: isOverdueItem ? '#EF4444' : 'text.secondary', fontWeight: isOverdueItem ? 700 : 400 }}>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusChip status={item.status} /></TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 110 }}>
                        <Select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default ActionItems;
