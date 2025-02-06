// src/components/AuthForm.tsx
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../utils/config';

interface LoginDto {
  email: string;
  password: string;
}

interface RegistrationDto {
  email: string;
  password: string;
}

interface AuthenticationResponse {
  token: string;
  user: {
    userID: number;
    email: string;
    // include any other user properties you need
  };
}

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success'>('success');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);

    try {
      if (isLogin) {
        // Call the login endpoint
        const loginDto: LoginDto = { email, password };
        const response = await axios.post<AuthenticationResponse>(
          `${API_URL}/api/auth/login`,
          loginDto
        );
        setAlertSeverity('success');
        setAlertMsg('Login successful!');
        console.log('Login response:', response.data);

        // Save the JWT token in localStorage for later use
        localStorage.setItem('jwtToken', response.data.token);
        
        // Redirect to the Budget Manager page
        navigate('/budget');
      } else {
        // Call the register endpoint
        const registrationDto: RegistrationDto = { email, password };
        const response = await axios.post(`${API_URL}/api/auth/register`, registrationDto);
        setAlertSeverity('success');
        setAlertMsg('Registration successful!');
        console.log('Registration response:', response.data);
      }
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
    <Container maxWidth="sm">
      <Paper sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          {isLogin ? 'Login' : 'Register'}
        </Typography>
        {alertMsg && (
          <Alert severity={alertSeverity} sx={{ marginBottom: 2 }}>
            {alertMsg}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
          <Grid container justifyContent="flex-end" sx={{ marginTop: 1 }}>
            <Grid item>
              <Button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAlertMsg(null);
                }}
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : 'Already have an account? Login'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AuthForm;


