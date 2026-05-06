import React from 'react';
import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  change?: number;
  changeLabel?: string;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  title, value, subtitle, icon, color = '#F59E0B', onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
        },
      }}
    >
      <CardContent sx={{
        p: 2.5, flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </Typography>
          <Box sx={{
            width: 40, height: 60, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.2)}`,
            color,
          }}>
            {icon}
          </Box>
        </Box>

        <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color: 'text.primary', lineHeight: 1, mb: 0.5 }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}

        {/* Decorative circle */}
        <Box sx={{
          position: 'absolute', right: -20, bottom: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: alpha(color, 0.04),
          border: `1px solid ${alpha(color, 0.06)}`,
        }} />
      </CardContent>
    </Card>
  );
};

export default KPICard;
