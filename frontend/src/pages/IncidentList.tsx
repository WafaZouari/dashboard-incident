import React from 'react';
import {
  Box, Typography, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate } from 'react-router-dom';
import IncidentTable from '../components/incidents/IncidentTable';
import { incidentApi } from '../services/api';

const IncidentList: React.FC = () => {
  const navigate = useNavigate();

  const handleExport = async () => {
    try {
      const res = await incidentApi.export();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidents-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { }
  };

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' }
          }}
        >
          Incidents
        </Typography>
        <Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Manage and track all safety incidents
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            fullWidth={false}
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            sx={{ flexGrow: { xs: 1, sm: 0 } }}
          >
            Export
          </Button>
          <Button
            fullWidth={false}
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/incidents/new')}
            sx={{ flexGrow: { xs: 1, sm: 0 } }}
          >
            New
          </Button>
        </Box>
      </Box>
      <IncidentTable />
    </Box>
  );
};

export default IncidentList;
