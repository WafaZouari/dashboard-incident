import { createTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

const basePalette = {
  amber: '#F59E0B',
  amberLight: '#FCD34D',
  cyan: '#06B6D4',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F97316',
  purple: '#8B5CF6',
};

const darkColors = {
  bgDefault: '#0A1628',
  bgPaper: '#0F2040',
  bgMid: '#162B4D',
  bgCard: '#1A3160',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: 'rgba(255,255,255,0.08)',
};

const lightColors = {
  bgDefault: '#F8FAFC',
  bgPaper: '#FFFFFF',
  bgMid: '#F1F5F9',
  bgCard: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: 'rgba(0,0,0,0.08)',
};

export const getTheme = (mode: 'light' | 'dark'): Theme => {
  const isDark = mode === 'dark';
  const c = isDark ? darkColors : lightColors;

  return createTheme({
    palette: {
      mode,
      primary: { main: basePalette.amber, light: basePalette.amberLight, dark: '#D97706', contrastText: isDark ? '#0A1628' : '#fff' },
      secondary: { main: basePalette.cyan, light: '#67E8F9', dark: '#0891B2', contrastText: '#fff' },
      success: { main: basePalette.green },
      warning: { main: basePalette.orange },
      error: { main: basePalette.red },
      background: { default: c.bgDefault, paper: c.bgPaper },
      text: { primary: c.textPrimary, secondary: c.textSecondary },
      divider: c.border,
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
      body2: { fontSize: '0.8rem', color: c.textSecondary },
      caption: { fontSize: '0.75rem', color: c.textSecondary },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark ? `linear-gradient(135deg, ${c.bgDefault} 0%, #0D1F3C 100%)` : c.bgDefault,
            scrollbarColor: `${c.bgCard} transparent`,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: c.bgCard, borderRadius: 3 },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark ? `linear-gradient(145deg, ${c.bgPaper} 0%, ${c.bgMid} 100%)` : c.bgCard,
            border: `1px solid ${c.border}`,
            backdropFilter: isDark ? 'blur(12px)' : 'none',
            boxShadow: isDark 
              ? `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)` 
              : `0 4px 12px rgba(0,0,0,0.03)`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': { boxShadow: isDark ? `0 8px 32px rgba(0,0,0,0.4)` : `0 8px 24px rgba(0,0,0,0.06)` },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: isDark ? `linear-gradient(145deg, ${c.bgPaper} 0%, ${c.bgMid} 100%)` : c.bgCard,
            border: `1px solid ${c.border}`,
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
            boxShadow: `0 4px 12px ${alpha(basePalette.amber, 0.3)}`,
            '&:hover': { boxShadow: `0 6px 20px ${alpha(basePalette.amber, 0.4)}`, transform: 'translateY(-1px)' },
          },
          outlined: {
            borderColor: alpha(basePalette.amber, 0.4),
            '&:hover': { borderColor: basePalette.amber, background: alpha(basePalette.amber, 0.08) },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              background: alpha(c.bgCard, isDark ? 0.5 : 1),
              '& fieldset': { borderColor: c.border },
              '&:hover fieldset': { borderColor: alpha(basePalette.amber, 0.4) },
              '&.Mui-focused fieldset': { borderColor: basePalette.amber },
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              background: isDark ? c.bgCard : c.bgMid,
              color: c.textSecondary,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderBottom: `1px solid ${c.border}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${c.border}`, padding: '12px 16px' },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { background: alpha(basePalette.amber, 0.04) },
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
            background: isDark ? `linear-gradient(180deg, ${c.bgDefault} 0%, #0D1F3C 100%)` : c.bgCard,
            borderRight: `1px solid ${c.border}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? `rgba(10, 22, 40, 0.8)` : `rgba(255, 255, 255, 0.8)`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${c.border}`,
            boxShadow: 'none',
            color: c.textPrimary,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            transition: 'all 0.2s ease',
            color: c.textPrimary,
            '&.Mui-selected': {
              background: `linear-gradient(90deg, ${alpha(basePalette.amber, 0.15)} 0%, ${alpha(basePalette.amber, 0.05)} 100%)`,
              borderLeft: `3px solid ${basePalette.amber}`,
              color: isDark ? basePalette.amber : '#D97706',
              '& .MuiListItemIcon-root': { color: isDark ? basePalette.amber : '#D97706' },
            },
            '&:hover': { background: alpha(basePalette.amber, 0.08) },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: isDark ? `linear-gradient(145deg, ${c.bgPaper} 0%, ${c.bgMid} 100%)` : c.bgCard,
            border: `1px solid ${c.border}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { background: c.bgCard, color: c.textPrimary, border: `1px solid ${c.border}`, fontSize: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: { background: alpha(c.bgCard, isDark ? 0.5 : 1) },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { background: basePalette.amber, height: 3, borderRadius: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': { color: isDark ? basePalette.amber : '#D97706', fontWeight: 600 },
          },
        },
      },
    },
  });
};

export default getTheme;
// Fallback for backwards compatibility in case something uses the static theme temporarily
export const theme = getTheme('dark'); 
export const palette = darkColors;
