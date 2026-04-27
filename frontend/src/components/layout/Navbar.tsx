import React from 'react';
import {
  Box, IconButton, Typography, Avatar, Menu, MenuItem,
  Tooltip, Badge, Chip, alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Shield';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authApi } from '../../services/api';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import DensitySmallIcon from '@mui/icons-material/DensitySmall';

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { compactMode, toggleCompactMode } = useUIStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/login');
  };

  const roleColor: Record<string, string> = {
    admin: '#EF4444', manager: '#F59E0B', investigator: '#06B6D4', viewer: '#10B981',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
      <IconButton 
        onClick={onMenuToggle} 
        edge="start" 
        sx={{ 
          color: 'text.secondary', 
          mr: 1,
          '&:hover': { background: alpha('#F59E0B', 0.1) }
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Spacer to push account items to the right */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Right side */}
      <Tooltip title={compactMode ? "Normal View" : "Compact View"}>
        <IconButton onClick={toggleCompactMode} sx={{ color: 'text.secondary' }}>
          {compactMode ? <DensityMediumIcon fontSize="small" /> : <DensitySmallIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Notifications">
        <IconButton sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Account">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
          <Avatar sx={{
            width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#0A1628',
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {user?.email}
          </Typography>
          <Chip
            label={user?.role?.toUpperCase()}
            size="small"
            sx={{
              mt: 0.5, height: 18, fontSize: '0.65rem',
              background: alpha(roleColor[user?.role || 'viewer'] || '#10B981', 0.15),
              color: roleColor[user?.role || 'viewer'] || '#10B981',
              border: `1px solid ${alpha(roleColor[user?.role || 'viewer'] || '#10B981', 0.3)}`,
            }}
          />
        </Box>
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ gap: 1.5, fontSize: '0.875rem' }}>
          <AccountCircleIcon fontSize="small" /> Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, fontSize: '0.875rem', color: 'error.main' }}>
          <LogoutIcon fontSize="small" /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Navbar;
