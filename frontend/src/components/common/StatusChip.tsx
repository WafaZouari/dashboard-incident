import React from 'react';
import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: '#EF4444' },
  under_investigation: { label: 'Investigating', color: '#F97316' },
  closed: { label: 'Closed', color: '#10B981' },
  archived: { label: 'Archived', color: '#6B7280' },
  pending: { label: 'Pending', color: '#F59E0B' },
  in_progress: { label: 'In Progress', color: '#06B6D4' },
  completed: { label: 'Completed', color: '#10B981' },
  overdue: { label: 'Overdue', color: '#EF4444' },
  accepted: { label: 'Accepted', color: '#8B5CF6' },
  refused: { label: 'Refused', color: '#6B7280' },
  low: { label: 'Low', color: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high: { label: 'High', color: '#F97316' },
  critical: { label: 'Critical', color: '#EF4444' },
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const config = statusConfig[status] || { label: status, color: '#6B7280' };
  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        background: alpha(config.color, 0.12),
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.3)}`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
      }}
    />
  );
};

export const SeverityBadge: React.FC<{ severity?: number | null }> = ({ severity }) => {
  const colors: Record<number, string> = {
    1: '#10B981', 2: '#84CC16', 3: '#F59E0B', 4: '#F97316', 5: '#EF4444',
  };
  const labels: Record<number, string> = {
    1: 'S1', 2: 'S2', 3: 'S3', 4: 'S4', 5: 'S5',
  };
  if (!severity) return <Chip label="—" size="small" sx={{ fontSize: '0.7rem', color: 'text.secondary' }} />;
  const color = colors[severity] || '#6B7280';
  return (
    <Chip
      label={labels[severity]}
      size="small"
      sx={{
        background: alpha(color, 0.15),
        color,
        border: `1px solid ${alpha(color, 0.35)}`,
        fontWeight: 700,
        fontSize: '0.72rem',
        minWidth: 36,
      }}
    />
  );
};

export default StatusChip;
