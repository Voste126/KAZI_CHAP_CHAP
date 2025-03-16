import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CssBaseline,
  Alert,
  AlertColor,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import API_URL from '../utils/config';
import Navbar from '../components/Navbar';
import ChangePasswordForm from './ChangePasswordForm';

// Theme colors
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

interface UserProfile {
  userID: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Alert states
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('success');
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Toggle state for ChangePasswordForm
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);

  const token = localStorage.getItem('jwtToken');

  // Fetch the user's current profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
        setOriginalProfile(response.data); // Keep a copy for comparison
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setAlertSeverity('error');
        setAlertMessage('Failed to fetch profile.');
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Check if any field changed from the original profile
  const hasChanged = (): boolean => {
    if (!profile || !originalProfile) return false;
    return (
      profile.firstName !== originalProfile.firstName ||
      profile.lastName !== originalProfile.lastName ||
      profile.email !== originalProfile.email ||
      profile.gender !== originalProfile.gender
    );
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle form submission to update profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const response = await axios.put(
        `${API_URL}/api/user/profile`,
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          email: profile.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update both profile + originalProfile
      setProfile(response.data);
      setOriginalProfile(response.data);

      setAlertSeverity('success');
      setAlertMessage('Profile updated successfully!');
      setShowAlert(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setAlertSeverity('error');
      setAlertMessage('Failed to update profile.');
      setShowAlert(true);
    }
  };

  // If still loading data
  if (loading) {
    return <Typography align="center">Loading profile...</Typography>;
  }

  // If no profile data
  if (!profile) {
    return (
      <>
        <Navbar />
        <CssBaseline />
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            backgroundColor: themeColors.background,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Typography align="center" sx={{ mt: 4 }}>
            No profile data found.
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CssBaseline />

      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          backgroundColor: themeColors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Paper
          sx={{
            p: 3,
            maxWidth: 600,
            width: '100%',
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: themeColors.primary }}>
            User Profile
          </Typography>

          {/* Alert at the top */}
          {showAlert && (
            <Alert
              severity={alertSeverity}
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowAlert(false)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {alertMessage}
            </Alert>
          )}

          {/* Profile update form */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
            />

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Gender</FormLabel>
              <RadioGroup
                row
                name="gender"
                value={profile.gender}
                onChange={handleChange}
              >
                <FormControlLabel value="Male" control={<Radio />} label="Male" />
                <FormControlLabel value="Female" control={<Radio />} label="Female" />
                <FormControlLabel value="Other" control={<Radio />} label="Other" />
              </RadioGroup>
            </FormControl>

            {/* 
              Place the "Change Password" toggle button at the right edge.
              If the form is displayed => button is Red, otherwise Green.
            */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => setShowChangePassword(!showChangePassword)}
                sx={{
                  backgroundColor: showChangePassword ? '#f44336' : '#006400', // red : green
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: showChangePassword ? '#7B1818' : '#388e3c', // darker red : darker green
                  },
                }}
              >
                {showChangePassword ? 'Hide Password Form' : 'Change Password'}
              </Button>
            </Box>

            {/* If toggled, display the ChangePasswordForm */}
            {showChangePassword && (
              <ChangePasswordForm token={token!} />
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!hasChanged()}
              sx={{
                mt: 3,
                backgroundColor: hasChanged() ? themeColors.primary : 'grey',
                color: '#fff',
                '&:hover': {
                  backgroundColor: hasChanged() ? themeColors.secondary : 'grey',
                },
              }}
            >
              Save Changes
            </Button>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default ProfilePage;


