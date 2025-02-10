// src/components/Auth/Logout.tsx
import React from 'react';
import { Button, Paper, CssBaseline, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../utils/config';
import logoutimage from '../../assets/baby.jpeg';

// Theme colors (same as in AuthForm.tsx)
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

interface LogoutProps {
  setToken: (token: string | null) => void;
}

const Logout: React.FC<LogoutProps> = ({ setToken }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await axios.post(`${API_URL}/api/auth/logout`);
      if (response.status === 200) {
        // Remove the token from local storage
        localStorage.removeItem('jwtToken');
        // Update application state by clearing the token
        setToken(null);
        // Optionally, show a success message
        alert(response.data.Message || 'Logged out successfully.');
        // Navigate to the login page (or any desired route)
        navigate('/auth');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Logout error:', error.response?.data || error.message);
      } else {
        console.error('Logout error:', error);
      }
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: themeColors.background,
          padding: 2,
        }}
      >
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: 6,
            maxWidth: '400px',
            width: '100%',
            backgroundColor: themeColors.accent,
          }}
        >
          {/* Display the logout image */}
          <Box
            component="img"
            src={logoutimage}
            alt="Logout"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              mb: 2,
            }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogout}
            sx={{
              backgroundColor: themeColors.primary,
              color: themeColors.background,
              '&:hover': { backgroundColor: themeColors.secondary },
            }}
          >
            Logout
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default Logout;


