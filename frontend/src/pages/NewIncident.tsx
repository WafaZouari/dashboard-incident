import React from 'react';
import { Box, Typography, Card, CardContent, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IncidentForm from '../components/incidents/IncidentForm';

const NewIncident: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="#" onClick={() => navigate('/dashboard')} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Dashboard</Link>
        <Link href="#" onClick={() => navigate('/incidents')} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Incidents</Link>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.primary' }}>New Incident</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Report New Incident</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Fill in all available details to ensure a complete incident record.
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 900 }}>
        <CardContent sx={{ p: 3 }}>
          <IncidentForm
            onSuccess={() => navigate('/incidents')}
            onCancel={() => navigate('/incidents')}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewIncident;
