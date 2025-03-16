import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import API_URL from '../utils/config';

// Theme colors
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

interface ChangePasswordProps {
  token: string;
  onClose?: () => void; // optional callback if you want to close a modal, etc.
}

const ChangePasswordForm: React.FC<ChangePasswordProps> = ({ token }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success'>('success');

  // State to track if user is focusing on the new password (to show password requirements)
  const [showRequirements, setShowRequirements] = useState(false);

  // Password complexity check
  const isStrongPassword = (pwd: string): boolean => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[\W_]/.test(pwd)
    );
  };

  // Define the password requirements
  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'At least one lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'At least one uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'At least one number', test: (pwd: string) => /\d/.test(pwd) },
    { label: 'At least one special character', test: (pwd: string) => /[\W_]/.test(pwd) },
  ];

  const handleChangePassword = async () => {
    setShowAlert(false);

    // Client-side checks
    if (newPassword !== confirmPassword) {
      setAlertSeverity('error');
      setAlertMsg('New password and confirm password do not match.');
      setShowAlert(true);
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setAlertSeverity('error');
      setAlertMsg('New password does not meet the complexity requirements.');
      setShowAlert(true);
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/user/profile/change-password`,
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If successful
      setAlertSeverity('success');
      setAlertMsg('Password changed successfully!');
      setShowAlert(true);

      // Clear the fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      console.error('Failed to change password:', error);
      setAlertSeverity('error');
      // The server might return "Old password is incorrect." or other messages
      const errMsg = (axios.isAxiosError(error) && error.response?.data) || 'Failed to change password.';
      setAlertMsg(errMsg);
      setShowAlert(true);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        width: 400,
        maxWidth: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        mt: 2, // some spacing from the profile form
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: themeColors.primary }}>
        Change Password
      </Typography>

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
          {alertMsg}
        </Alert>
      )}

      <TextField
        label="Old Password"
        type={showOldPassword ? 'text' : 'password'}
        fullWidth
        required
        variant="outlined"
        margin="normal"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                {showOldPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="New Password"
        type={showNewPassword ? 'text' : 'password'}
        fullWidth
        required
        variant="outlined"
        margin="normal"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        onFocus={() => setShowRequirements(true)}
        onBlur={() => setShowRequirements(false)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Display the password requirements below the "New Password" field when focused or non-empty */}
      {(showRequirements || newPassword.length > 0) && (
        <Box sx={{ ml: 1, mb: 2 }}>
          {passwordRequirements.map((req, idx) => {
            const satisfied = req.test(newPassword);
            return (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: satisfied ? 'green' : 'red',
                  fontSize: '0.9rem',
                  mt: 0.5,
                }}
              >
                {satisfied ? (
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                ) : (
                  <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                )}
                <span>{req.label}</span>
              </Box>
            );
          })}
        </Box>
      )}

      <TextField
        label="Confirm New Password"
        type={showNewPassword ? 'text' : 'password'}
        fullWidth
        required
        variant="outlined"
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 2,
          backgroundColor: themeColors.primary,
          color: '#fff',
          '&:hover': { backgroundColor: themeColors.secondary },
        }}
        onClick={handleChangePassword} // <--- onClick instead of form submit
      >
        Change Password
      </Button>
    </Box>
  );
};

export default ChangePasswordForm;

