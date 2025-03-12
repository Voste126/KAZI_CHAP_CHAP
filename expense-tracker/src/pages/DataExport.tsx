// src/pages/DataExport.tsx

import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Container,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API_URL from '../utils/config';

const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

const DataExport: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();

  const handleDownload = async () => {
    if (!userId) {
      setError('Please enter a user ID.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Make a GET request to download the CSV.
      const response = await axios.get(`${API_URL}/api/csv/download/${userId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Create a blob from the response data and generate a URL.
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download.
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UserData_${userId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        setError('You are not authorized. Please log in as an admin.');
        navigate('/login');
      } else {
        setError('Failed to download CSV. Please ensure you have the correct permissions and user ID.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: themeColors.background,
      }}
    >
      {/* Top AppBar */}
      <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Data Export
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Container maxWidth="sm">
          {/* Display error if any */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Paper section for the form */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: themeColors.primary }}>
              Export User Data as CSV
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: themeColors.text, mb: 2 }}>
              Enter the user ID below to export all data associated with that user. (Admin only)
            </Typography>

            <TextField
              label="User ID"
              variant="outlined"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Use Stack to add spacing between the two buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                sx={{ backgroundColor: themeColors.primary, color: '#fff' }}
                onClick={handleDownload}
                disabled={loading}
              >
                {loading ? 'Downloading...' : 'Download CSV'}
              </Button>

              <Button
                variant="outlined"
                sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default DataExport;




