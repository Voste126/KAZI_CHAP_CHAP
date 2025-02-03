import React, { useState } from 'react';
import useAuth  from '';
import { Box, Button, TextField, Typography } from '@mui/material';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            alert('Login successful!');
        } catch (error) {
            alert('Login failed.');
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Login
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Email"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Login
                </Button>
            </form>
        </Box>
    );
};

export default Login;