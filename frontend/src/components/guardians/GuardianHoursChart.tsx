import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, alpha, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { guardianApi } from '../../services/guardianApi';

const GuardianHoursChart: React.FC = () => {
  const [data, setData] = useState<{ name: string; hours: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await guardianApi.getWorkingHours();
        if (response.data.success) {
          setData(response.data.data.slice(0, 10)); // Top 10 for better visualization
        }
      } catch (error) {
        console.error('Failed to load working hours', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          Working Hours Distribution (Top 10 Guardians)
        </Typography>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper, 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="hours" 
                name="Total Hours"
                fill={theme.palette.primary.main} 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GuardianHoursChart;
