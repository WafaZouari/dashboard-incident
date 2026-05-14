import React, { useState } from 'react';
import { Box, AppBar, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store/uiStore';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 64;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { compactMode } = useUIStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const currentWidth = isMobile ? 0 : (sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={!sidebarOpen && !isMobile}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED}
        isMobile={isMobile}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: isMobile ? '100%' : `calc(100% - ${currentWidth}px)`,
            ml: isMobile ? 0 : `${currentWidth}px`,
            bgcolor: 'background.default',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar sx={{ px: 2, minHeight: 64 }}>
            <Navbar onMenuToggle={handleSidebarToggle} />
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: '64px',
            bgcolor: 'background.default',
            overflowX: 'hidden',
          }}
        >
          <Box sx={{ p: compactMode ? { xs: 0.5, sm: 1 } : { xs: 1.5, sm: 2, md: 3 } }}>
            <Box sx={{ maxWidth: '1600px', mx: 'auto', width: '100%' }}>
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
