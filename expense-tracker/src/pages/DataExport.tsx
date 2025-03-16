import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Button,
  Alert,
  Container,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

interface User {
  userID: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  createdAt: string;
}

const DataExport: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();

  // Fetch all users from the admin endpoint.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/AdminPanel/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Check if response.data is an array, if not try extracting $values.
        const usersData = Array.isArray(response.data)
          ? response.data
          : response.data.$values || [];
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch users.');
      }
    };
    fetchUsers();
  }, [token]);

  const handleDownload = async () => {
    if (!selectedUserId) {
      setError('Please select a user.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // GET the CSV file for the selected user.
      const response = await axios.get(`${API_URL}/api/csv/download/${selectedUserId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Create a blob URL for the CSV file.
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      // Trigger the download.
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UserData_${selectedUserId}.csv`);
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
      <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Data Export
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Container maxWidth="sm">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: themeColors.primary }}>
              Export User Data as CSV
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: themeColors.text, mb: 2 }}>
              Select a user from the dropdown below to export all data associated with that user. (Admin only)
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="user-select-label">Select User</InputLabel>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUserId}
                label="Select User"
                onChange={(e) => setSelectedUserId(e.target.value as string)}
              >
                {users.map((user) => (
                  <MenuItem key={user.userID} value={user.userID.toString()}>
                    {user.firstName} {user.lastName} (ID: {user.userID})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: themeColors.primary,
                  color: themeColors.background,
                  '&:hover': { backgroundColor: themeColors.secondary },
                }}
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
