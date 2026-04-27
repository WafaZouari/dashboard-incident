import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  navy: '#0A1628',
  navyLight: '#0F2040',
  navyMid: '#162B4D',
  navyCard: '#1A3160',
  amber: '#F59E0B',
  amberLight: '#FCD34D',
  cyan: '#06B6D4',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F97316',
  purple: '#8B5CF6',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: 'rgba(255,255,255,0.08)',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: palette.amber, light: palette.amberLight, dark: '#D97706', contrastText: '#0A1628' },
    secondary: { main: palette.cyan, light: '#67E8F9', dark: '#0891B2', contrastText: '#fff' },
    success: { main: palette.green },
    warning: { main: palette.orange },
    error: { main: palette.red },
    background: { default: palette.navy, paper: palette.navyLight },
    text: { primary: palette.textPrimary, secondary: palette.textSecondary },
    divider: palette.border,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '0.875rem', fontWeight: 600 },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem', color: palette.textSecondary },
    caption: { fontSize: '0.75rem', color: palette.textSecondary },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${palette.navy} 0%, #0D1F3C 100%)`,
          scrollbarColor: `${palette.navyCard} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: palette.navyCard, borderRadius: 3 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: `linear-gradient(145deg, ${palette.navyLight} 0%, ${palette.navyMid} 100%)`,
          border: `1px solid ${palette.border}`,
          backdropFilter: 'blur(12px)',
          boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': { boxShadow: `0 8px 32px rgba(0,0,0,0.4)` },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: `linear-gradient(145deg, ${palette.navyLight} 0%, ${palette.navyMid} 100%)`,
          border: `1px solid ${palette.border}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: `0 4px 12px rgba(245,158,11,0.3)`,
          '&:hover': { boxShadow: `0 6px 20px rgba(245,158,11,0.4)`, transform: 'translateY(-1px)' },
        },
        outlined: {
          borderColor: alpha(palette.amber, 0.4),
          '&:hover': { borderColor: palette.amber, background: alpha(palette.amber, 0.08) },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: alpha(palette.navyCard, 0.5),
            '& fieldset': { borderColor: palette.border },
            '&:hover fieldset': { borderColor: alpha(palette.amber, 0.4) },
            '&.Mui-focused fieldset': { borderColor: palette.amber },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: palette.navyCard,
            color: palette.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: `1px solid ${palette.border}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${palette.border}`, padding: '12px 16px' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { background: alpha(palette.amber, 0.04) },
          transition: 'background 0.15s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.72rem', borderRadius: 6 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${palette.navy} 0%, #0D1F3C 100%)`,
          borderRight: `1px solid ${palette.border}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `rgba(10, 22, 40, 0.8)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${palette.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            background: `linear-gradient(90deg, ${alpha(palette.amber, 0.15)} 0%, ${alpha(palette.amber, 0.05)} 100%)`,
            borderLeft: `3px solid ${palette.amber}`,
            color: palette.amber,
            '& .MuiListItemIcon-root': { color: palette.amber },
          },
          '&:hover': { background: alpha(palette.amber, 0.08) },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(145deg, ${palette.navyLight} 0%, ${palette.navyMid} 100%)`,
          border: `1px solid ${palette.border}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { background: palette.navyCard, border: `1px solid ${palette.border}`, fontSize: '0.75rem' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { background: alpha(palette.navyCard, 0.5) },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { background: palette.amber, height: 3, borderRadius: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': { color: palette.amber, fontWeight: 600 },
        },
      },
    },
  },
});

export default theme;
export { palette };
