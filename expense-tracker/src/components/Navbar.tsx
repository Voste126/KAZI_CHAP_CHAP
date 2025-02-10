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

// Theme colors (adjust as needed)
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  // Get token from localStorage (later you might manage this via Context)
  const token = localStorage.getItem('jwtToken');

  // Always-available navigation menu items
  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Budget', path: '/budget' },
    { label: 'Expenses', path: '/expenses' },
    { label: 'Visuals', path: '/visual' },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Remove token and navigate to login page
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
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
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
              {/* Conditionally render Login/Sign Up or Logout */}
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
            {/* Conditionally render Login/Sign Up or Logout */}
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


