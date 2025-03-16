// src/components/Navbar.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  role: string;
}

const themeColors = {
  primary: '#006400',
  secondary: '#8B4513',
  background: '#F5F5DC',
  text: '#2F4F4F',
  accent: '#FFD700',
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const token = localStorage.getItem('jwtToken');
  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      isAdmin = decoded.role === 'Admin';
    } catch (error) {
      console.error('Token decoding error:', error);
      isAdmin = false;
    }
  }

  // Build the menu items array
  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Budget', path: '/budget' },
    { label: 'Expenses', path: '/expenses' },
    { label: 'Visuals', path: '/visual' },
    // Show "Profile" only if logged in
    ...(token ? [{ label: 'Profile', path: '/profile' }] : []),
    // Show "Notifications" only if logged in
    ...(token ? [{ label: 'Notifications', path: '/notifications' }] : []),
    // Show admin items only if user is an admin
    ...(isAdmin ? [{ label: 'Admin Panel', path: '/admin' }] : []),
    ...(isAdmin ? [{ label: 'Data Export', path: '/data-export' }] : []),
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          KAZI CHAP CHAP
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              {menuItems.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    handleMenuClose();
                    navigate(item.path);
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
              {!token ? (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate('/login');
                  }}
                >
                  Login/Sign Up
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                >
                  Logout
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
            {!token ? (
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login/Sign Up
              </Button>
            ) : (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
