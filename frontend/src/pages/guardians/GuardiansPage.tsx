import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import GuardianTable from '../../components/guardians/GuardianTable';
import GuardianForm from '../../components/guardians/GuardianForm';
import ShiftManagement from '../../components/guardians/ShiftManagement';
import GuardianCalendar from '../../components/guardians/GuardianCalendar';
import SecurityIcon from '@mui/icons-material/Security';
import type { Guardian, GuardianFormData } from '../../types/guardian';
import { guardianApi } from '../../services/guardianApi';

const GuardiansPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  
  // Guardian Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
