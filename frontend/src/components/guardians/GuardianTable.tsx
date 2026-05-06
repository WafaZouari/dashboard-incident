import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Tooltip, Chip, alpha, useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SecurityIcon from '@mui/icons-material/Security';
import type { Guardian } from '../../types/guardian';
import { guardianApi } from '../../services/guardianApi';

interface GuardianTableProps {
  onEdit: (guardian: Guardian) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

const GuardianTable: React.FC<GuardianTableProps> = ({ onEdit, onAdd, refreshTrigger = 0 }) => {
  const theme = useTheme();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchGuardians = async () => {
    setLoading(true);
    try {
      const res = await guardianApi.getGuardians({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      if (res.data.success) {
        setGuardians(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch guardians', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuardians();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, rowsPerPage, search, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this guardian?')) {
      try {
        await guardianApi.deleteGuardian(id);
        fetchGuardians();
      } catch (error) {
        console.error('Failed to delete guardian', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search guardians..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }
          }}
          sx={{ minWidth: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)' }}
        >
          Add Guardian
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guardian Info</TableCell>
              <TableCell>Badge ID</TableCell>
              <TableCell>Rank/Role</TableCell>
              <TableCell>Site/Zone</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>Loading...</TableCell></TableRow>
            ) : guardians.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No guardians found.</TableCell></TableRow>
            ) : (
              guardians.map((guardian) => (
                <TableRow key={guardian.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{guardian.fullName}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{guardian.badgeId || '—'}</TableCell>
                  <TableCell>{guardian.rank || '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{guardian.site || '—'}</Typography>
                    {guardian.zone && <Typography variant="caption" color="text.secondary">{guardian.zone}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{guardian.phone || '—'}</Typography>
                    {guardian.email && <Typography variant="caption" color="text.secondary">{guardian.email}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={guardian.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={guardian.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(guardian)} sx={{ mr: 1, color: 'primary.main' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate">
                      <IconButton size="small" onClick={() => handleDelete(guardian.id)} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      </TableContainer>
    </Box>
  );
};

export default GuardianTable;
