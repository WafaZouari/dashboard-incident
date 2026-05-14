import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import GuardianTable from '../../components/guardians/GuardianTable';
import GuardianForm from '../../components/guardians/GuardianForm';
import ShiftManagement from '../../components/guardians/ShiftManagement';
import GuardianCalendar from '../../components/guardians/GuardianCalendar';
import GuardianHoursChart from '../../components/guardians/GuardianHoursChart';
import SecurityIcon from '@mui/icons-material/Security';
import type { Guardian, GuardianFormData } from '../../types/guardian';
import { guardianApi } from '../../services/guardianApi';

const GuardiansPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  
  // Guardian Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await guardianApi.getStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const handleOpenForm = (guardian?: Guardian) => {
    setEditingGuardian(guardian || null);
    setFormOpen(true);
  };

  const handleSaveGuardian = async (data: GuardianFormData) => {
    try {
      if (editingGuardian) {
        await guardianApi.updateGuardian(editingGuardian.id, data);
      } else {
        await guardianApi.createGuardian(data);
      }
      setFormOpen(false);
      setRefreshKey(prev => prev + 1);
      setTab(0); 
    } catch (error) {
      console.error('Failed to save guardian', error);
      alert('Failed to save guardian');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SecurityIcon sx={{ color: '#0A1628', fontSize: 24 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
          Guardians Management
        </Typography>
      </Box>

      {/* Statistics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderLeft: '4px solid #3B82F6' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', mr: 2 }}>
                <PeopleIcon sx={{ color: '#3B82F6' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Guardians</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.total}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderLeft: '4px solid #10B981' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', mr: 2 }}>
                <CheckCircleIcon sx={{ color: '#10B981' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Active Personnel</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.active}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderLeft: '4px solid #EF4444' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', mr: 2 }}>
                <HighlightOffIcon sx={{ color: '#EF4444' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Inactive / Leave</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.inactive}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Chart Section */}
      <Box sx={{ mb: 4 }}>
        <GuardianHoursChart />
      </Box>

      <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Guardians List" />
          <Tab label="Schedule Calendar" />
          <Tab label="Shift Types" />
        </Tabs>
      </Paper>

      <Box sx={{ minHeight: '60vh' }}>
        {tab === 0 && (
          <GuardianTable 
            onAdd={() => handleOpenForm()} 
            onEdit={(g) => handleOpenForm(g)} 
            refreshTrigger={refreshKey}
          />
        )}
        {tab === 1 && <GuardianCalendar />}
        {tab === 2 && <ShiftManagement />}
      </Box>

      {/* Shared Guardian Form */}
      <GuardianForm
        open={formOpen}
        guardian={editingGuardian}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveGuardian}
      />
    </Box>
  );
};

export default GuardiansPage;
