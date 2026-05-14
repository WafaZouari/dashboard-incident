import React from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Tooltip, Divider, useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Report';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HexagonIcon from '@mui/icons-material/Hexagon';
import ShieldIcon from '@mui/icons-material/Shield';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const allNavItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: 'viewDashboard' },
  { label: 'Incidents', icon: <ReportIcon />, path: '/incidents', permission: 'viewIncidents' },
  { label: 'Analytics', icon: <BarChartIcon />, path: '/analytics', permission: 'viewAnalytics' },
  { label: 'Investigations', icon: <SearchIcon />, path: '/investigations', permission: 'manageInvestigations' },
  { label: 'Action Items', icon: <AssignmentIcon />, path: '/action-items', permission: 'viewActionItems' },
  { label: 'Guardians', icon: <ShieldIcon />, path: '/guardians', permission: 'manageGuardians' },
  { label: 'Roles management', icon: <AdminPanelSettingsIcon />, path: '/roles', permission: 'all' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  width: number;
  collapsedWidth: number;
  isMobile: boolean;
}

const SidebarContent: React.FC<{ collapsed: boolean; onClose?: () => void }> = ({ collapsed, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const permissions = user?.permissions || {};

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const navItems = allNavItems.filter(item => {
    if (permissions.all) return true;
    if (item.permission === 'viewDashboard') return true; // always show dashboard just in case, or fallback to permissions.viewDashboard
    return permissions[item.permission];
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 1 }}>
      {/* Brand */}
      <Box sx={{
        px: collapsed ? 1.5 : 2.5,
        py: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: 80,
        transition: 'padding 0.3s ease',
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(245,158,11,0.25)',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.05) rotate(-5deg)' }
        }}>
          <HexagonIcon sx={{ fontSize: 24, color: '#0A1628' }} />
        </Box>
        {!collapsed && (
          <Box sx={{
            opacity: 1,
            transition: 'opacity 0.2s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
              TPS
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Incident Manager
            </Typography>
          </Box>
        )}
      </Box>

      {/* Nav items */}
      <List sx={{ px: 0, py: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const btn = (
            <ListItemButton
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={active ? 'Mui-selected' : ''}
              sx={{
                mx: 1, borderRadius: '8px', py: 1.2,
                ...(collapsed ? { justifyContent: 'center', px: 1 } : {}),
              }}
            >
              <ListItemIcon sx={{
                minWidth: collapsed ? 0 : 36,
                color: active ? 'primary.main' : 'text.secondary',
                '& .MuiSvgIcon-root': { fontSize: 20 },
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } } }}
                />
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              {btn}
            </Tooltip>
          ) : btn;
        })}
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: 'divider' }} />
      <Box sx={{ px: 2, py: 1.5, display: collapsed ? 'none' : 'block' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
          © 2026 TPS Management
        </Typography>
      </Box>
    </Box>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen, onMobileClose, collapsed, width, collapsedWidth, isMobile,
}) => {
  const theme = useTheme();
  const drawerWidth = isMobile ? width : (collapsed ? collapsedWidth : width);

  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } }}
        >
          <SidebarContent collapsed={false} onClose={onMobileClose} />
        </Drawer>
      )}

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              bgcolor: 'background.default',
              color: 'text.primary',
              borderRight: '1px solid',
              borderColor: 'divider',
              boxSizing: 'border-box',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <SidebarContent collapsed={collapsed} />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
