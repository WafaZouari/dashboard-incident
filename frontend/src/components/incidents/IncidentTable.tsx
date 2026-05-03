import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel, Typography,
  IconButton, Tooltip, TextField, InputAdornment, Select, MenuItem,
  FormControl, CircularProgress, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';
import { incidentApi } from '../../services/api';
import { StatusChip, SeverityBadge } from '../common/StatusChip';
import type { Incident } from '../../types';

const PEAR_CLASSES = ['Injury/Illness', 'Asset Damage', 'Environmental', 'Security', 'PSE'];
const YEARS = [2024, 2025, 2026];

const IncidentTable: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [orderBy, setOrderBy] = useState('dateTimeOccurred');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
        search: search || undefined,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        year: yearFilter || undefined,
      };
      const res = await incidentApi.getAll(params);
      setIncidents(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, order, search, statusFilter, severityFilter, yearFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchIncidents, 300);
    return () => clearTimeout(timer);
  }, [fetchIncidents]);

  const handleSort = (col: string) => {
    if (orderBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setOrderBy(col); setOrder('asc'); }
    setPage(0);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to PERMANENTLY delete this incident? This action cannot be undone.')) return;
    try {
      await incidentApi.delete(id);
      fetchIncidents();
    } catch { }
  };

  const clearFilters = () => {
    setStatusFilter(''); setSeverityFilter(''); setYearFilter(''); setSearch(''); setPage(0);
  };

  const { downSm, downMd } = useResponsive();

  const cols = [
    { id: 'incidentNo', label: 'Incident No.', sortable: true, width: 120 },
    { id: 'briefDescription', label: 'Description', sortable: false },
    { id: 'dateTimeOccurred', label: 'Date', sortable: true, width: 95 },
    ...(!downMd ? [{ id: 'site', label: 'Site', sortable: true, width: 120 }] : []),
    ...(!downMd ? [{ id: 'pearClass', label: 'PEAR Class', sortable: true, width: 130 }] : []),
    { id: 'actualSeverity', label: 'Sev.', sortable: true, width: 60 },
    { id: 'status', label: 'Status', sortable: true, width: 120 },
    { id: 'actions', label: '', sortable: false, width: 100 },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        {/* Toolbar */}
        <Box sx={{
          display: 'flex', gap: 1.5, p: 2,
          borderBottom: '1px solid', borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <TextField
            size="small"
            placeholder="Search incidents, sites, reporters..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
            sx={{ minWidth: { xs: '100%', sm: 240 }, flexGrow: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} displayEmpty>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="under_investigation">Investigating</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }} displayEmpty>
                <MenuItem value="">All Sev.</MenuItem>
                {[1, 2, 3, 4, 5].map((s) => <MenuItem key={s} value={s}>S{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(0); }} displayEmpty>
                <MenuItem value="">All Years</MenuItem>
                {YEARS.map((y) => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <Tooltip title="Clear filters">
              <IconButton size="small" onClick={clearFilters}><FilterListIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {cols.map((col) => (
                  <TableCell key={col.id} style={{ width: col.width }} align={col.id === 'actions' ? 'right' : 'left'}>
                    {col.sortable ? (
                      <TableSortLabel active={orderBy === col.id} direction={orderBy === col.id ? order : 'asc'} onClick={() => handleSort(col.id)}>
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={cols.length} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : incidents.length === 0 ? (
                <TableRow><TableCell colSpan={cols.length} align="center" sx={{ py: 6, color: 'text.secondary' }}>No incidents found</TableCell></TableRow>
              ) : incidents.map((inc) => (
                <TableRow key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'primary.main', fontWeight: 600 }}>
                      {inc.incidentNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, maxWidth: { xs: 150, md: 320 } }} noWrap>
                      {inc.briefDescription || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                      {inc.dateTimeOccurred ? new Date(inc.dateTimeOccurred).toLocaleDateString() : '—'}
                    </Typography>
                  </TableCell>
                  {!downMd && (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography sx={{ fontSize: '0.72rem' }} noWrap>{inc.site || '—'}</Typography>
                      </Box>
                    </TableCell>
                  )}
                  {!downMd && (
                    <TableCell>
                      {inc.pearClass ? (
                        <Chip label={inc.pearClass} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                      ) : '—'}
                    </TableCell>
                  )}
                  <TableCell><SeverityBadge severity={inc.actualSeverity} /></TableCell>
                  <TableCell><StatusChip status={inc.status} /></TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="View"><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/incidents/${inc.id}`); }}><VisibilityIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                      {!downSm && (
                        <>
                          <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/incidents/${inc.id}/edit`); }}><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={(e) => handleDelete(inc.id, e)} sx={{ color: 'error.main' }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 15, 25, 50]}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </CardContent>
    </Card>
  );
};

export default IncidentTable;
