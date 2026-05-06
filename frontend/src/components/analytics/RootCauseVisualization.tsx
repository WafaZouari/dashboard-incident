import React from 'react';
import { Box, Typography, Grid, Card, CardContent, alpha, Paper } from '@mui/material';
import type { AIRootCauseAnalysis } from '../../types';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface Props {
  data: AIRootCauseAnalysis;
}

const IshikawaCard: React.FC<{ title: string; items: string[]; color: string }> = ({ title, items, color }) => (
  <Card sx={{ height: '100%', border: `1px solid ${alpha(color, 0.3)}`, background: alpha(color, 0.04) }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No causes identified</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: color, mt: 1, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ lineHeight: 1.5, color: 'text.primary' }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </CardContent>
  </Card>
);

const RootCauseVisualization: React.FC<Props> = ({ data }) => {
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccountTreeIcon sx={{ color: '#8B5CF6' }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Ishikawa (Fishbone) Analysis</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <IshikawaCard title="Manpower" items={data.ishikawa.manpower} color="#EF4444" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <IshikawaCard title="Machine" items={data.ishikawa.machine} color="#3B82F6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <IshikawaCard title="Material" items={data.ishikawa.material} color="#F59E0B" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <IshikawaCard title="Method" items={data.ishikawa.method} color="#10B981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <IshikawaCard title="Environment" items={data.ishikawa.environment} color="#8B5CF6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <IshikawaCard title="Measurement" items={data.ishikawa.measurement} color="#EC4899" />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 2, mt: 4 }}>
        <TimelineIcon sx={{ color: '#06B6D4' }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>The 5 Whys</Typography>
      </Box>

      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          background: alpha('#06B6D4', 0.04),
          border: `1px solid ${alpha('#06B6D4', 0.2)}`
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.fiveWhys.map((item, index) => (
            <Box key={index} sx={{ position: 'relative' }}>

              {index < data.fiveWhys.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 15,
                    top: 32,
                    bottom: -16,
                    width: 2,
                    background: alpha('#06B6D4', 0.2)
                  }}
                />
              )}

              {/* Row wrapper */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>

                {/* Number */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#06B6D4',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    zIndex: 1
                  }}
                >
                  {index + 1}
                </Box>

                {/* TEXT BLOCK (this is the key fix) */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      textAlign: 'left'
                    }}
                  >
                    Why? {item.why}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textAlign: 'left',
                      mt: 0.5
                    }}
                  >
                    {item.answer}
                  </Typography>
                </Box>

              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default RootCauseVisualization;
