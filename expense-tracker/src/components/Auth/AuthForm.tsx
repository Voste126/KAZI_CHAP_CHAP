import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  Divider,
  CssBaseline,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../utils/config';

// Theme colors
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#006400',// Background Green
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

/* --------------------- LOGIN FORM --------------------- */
interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = React.memo(
  ({ email, setEmail, password, setPassword, handleSubmit }) => {
    const [touched, setTouched] = useState({ email: false, password: false });
    const [showPassword, setShowPassword] = useState(false);

    const isValidEmail = (em: string): boolean =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

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
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={touched.email && !isValidEmail(email)}
          helperText={touched.email && !isValidEmail(email) ? "Enter a valid email" : ""}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={touched.password && password.trim() === ""}
          helperText={touched.password && password.trim() === "" ? "Password is required" : ""}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: themeColors.primary,
            color: '#fff', // Text color changed to white
            '&:hover': { backgroundColor: themeColors.secondary },
          }}
        >
          Login
        </Button>
      </Box>
    );
  }
);

/* ------------------- REGISTER FORM ------------------- */
interface RegisterFormProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = React.memo(
  ({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    gender,
    setGender,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
  }) => {
    const [touched, setTouched] = useState({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      confirmPassword: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Show or hide the password requirements
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const isValidEmail = (em: string): boolean =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

    const isStrongPassword = (pwd: string): boolean =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd);

    // Requirements for a strong password
    const passwordRequirements = [
      {
        label: "At least 8 characters",
        test: (pwd: string) => pwd.length >= 8,
      },
      {
        label: "At least one lowercase letter",
        test: (pwd: string) => /[a-z]/.test(pwd),
      },
      {
        label: "At least one uppercase letter",
        test: (pwd: string) => /[A-Z]/.test(pwd),
      },
      {
        label: "At least one number",
        test: (pwd: string) => /\d/.test(pwd),
      },
      {
        label: "At least one special character",
        test: (pwd: string) => /[\W_]/.test(pwd),
      },
    ];

    const isFormValid =
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      gender.trim() !== "" &&
      isValidEmail(email) &&
      isStrongPassword(password) &&
      password === confirmPassword;

    // Show the requirements if focused or if the password is non-empty
    const showRequirements = showPasswordRequirements || password.length > 0;

    return (
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          label="First Name"
          type="text"
          fullWidth
          margin="normal"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
          error={touched.firstName && firstName.trim() === ""}
          helperText={touched.firstName && firstName.trim() === "" ? "First name is required" : ""}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Last Name"
          type="text"
          fullWidth
          margin="normal"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
          error={touched.lastName && lastName.trim() === ""}
          helperText={touched.lastName && lastName.trim() === "" ? "Last name is required" : ""}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />

        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup
            row
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel value="Female" control={<Radio />} label="Female" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={touched.email && !isValidEmail(email)}
          helperText={touched.email && !isValidEmail(email) ? "Enter a valid email" : ""}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setShowPasswordRequirements(true)}
          onBlur={() => setShowPasswordRequirements(false)}
          error={touched.password && !isStrongPassword(password)}
          helperText={
            touched.password
              ? isStrongPassword(password)
                ? "Strong password"
                : "Weak password"
              : "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
          }
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: password
                  ? isStrongPassword(password)
                    ? 'green'
                    : 'red'
                  : undefined,
              },
            },
          }}
        />

        {/* Password Requirements List */}
        {showRequirements && (
          <Box sx={{ mt: 1, mb: 2 }}>
            {passwordRequirements.map((req, idx) => {
              const satisfied = req.test(password);
              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: satisfied ? 'green' : 'red',
                    fontSize: '0.9rem',
                    mb: 0.5,
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
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
          error={touched.confirmPassword && confirmPassword !== password}
          helperText={touched.confirmPassword && confirmPassword !== password ? "Passwords do not match" : ""}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!isFormValid}
          sx={{
            mt: 2,
            backgroundColor: isFormValid ? themeColors.primary : 'grey',
            color: '#fff', // Text color changed to white
            '&:hover': {
              backgroundColor: isFormValid ? themeColors.secondary : 'grey',
            },
          }}
        >
          Register
        </Button>
      </Box>
    );
  }
);

/* --------------------- AUTH FORM (PARENT) --------------------- */
interface AuthFormProps {
  setToken: (token: string | null) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ setToken }) => {
  const navigate = useNavigate();
  // activeTab: 0 for Login, 1 for Register
  const [activeTab, setActiveTab] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
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
      setToken(newToken);
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
    try {
      await axios.post(`${API_URL}/api/auth/register`, { firstName, lastName, gender, email, password });
      setAlertSeverity('success');
      setAlertMsg('Registration successful! Please login.');
      // Clear fields and switch to Login tab
      setFirstName('');
      setLastName('');
      setGender('');
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
      {/* Full viewport background */}
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          backgroundColor: themeColors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* The Paper is now wider to make forms larger */}
        <Paper sx={{ width: 500, borderRadius: 2, boxShadow: 6, overflow: 'hidden' }}>
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
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              gender={gender}
              setGender={setGender}
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
      </Box>
    </>
  );
};

export default AuthForm;

