// src/components/Auth/AuthForm.tsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Alert,
  Divider,
  CssBaseline,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../utils/config';

// Theme colors
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

interface AuthenticationResponse {
  token: string;
  user: {
    userID: number;
    email: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

interface AuthFormProps {
  setToken: (token: string | null) => void;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = React.memo(
  ({ email, setEmail, password, setPassword, handleSubmit }) => {
    return (
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: themeColors.primary,
            color: themeColors.background,
            '&:hover': { backgroundColor: themeColors.secondary },
          }}
        >
          Login
        </Button>
      </Box>
    );
  }
);

interface RegisterFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = React.memo(
  ({ email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, handleSubmit }) => {
    return (
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: themeColors.primary,
            color: themeColors.background,
            '&:hover': { backgroundColor: themeColors.secondary },
          }}
        >
          Register
        </Button>
      </Box>
    );
  }
);

const AuthForm: React.FC<AuthFormProps> = ({ setToken }) => {
  const navigate = useNavigate();
  // activeTab: 0 for Login, 1 for Register
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success'>('success');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setAlertMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);
    try {
      const response = await axios.post<AuthenticationResponse>(
        `${API_URL}/api/auth/login`,
        { email, password }
      );
      setAlertSeverity('success');
      setAlertMsg('Login successful!');
      const newToken = response.data.token;
      localStorage.setItem('jwtToken', newToken);
      setToken(newToken); // Update the token in App state
      console.log('Logged in as:', response.data.user, 'Token:', newToken);
      navigate('/'); // Redirect to the main page
    } catch (err: unknown) {
      setAlertSeverity('error');
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        setAlertMsg(err.response.data);
      } else {
        setAlertMsg('An error occurred. Please try again.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);
    if (password !== confirmPassword) {
      setAlertSeverity('error');
      setAlertMsg('Passwords do not match.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, password });
      setAlertSeverity('success');
      setAlertMsg('Registration successful! Please login.');
      // Clear fields and switch to Login tab
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setActiveTab(0);
    } catch (err: unknown) {
      setAlertSeverity('error');
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        setAlertMsg(err.response.data);
      } else {
        setAlertMsg('An error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`,
        }}
      >
        <Paper sx={{ width: '100%', borderRadius: 2, boxShadow: 6, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: themeColors.secondary },
              color: themeColors.primary,
            }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          {alertMsg && (
            <Alert severity={alertSeverity} sx={{ mx: 2, mt: 2 }}>
              {alertMsg}
            </Alert>
          )}
          <Divider />
          <TabPanel value={activeTab} index={0}>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSubmit={handleLogin}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <RegisterForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              handleSubmit={handleRegister}
            />
          </TabPanel>
        </Paper>
      </Container>
    </>
  );
};

export default AuthForm;



