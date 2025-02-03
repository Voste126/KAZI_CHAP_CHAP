import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Button, TextField, Typography } from '@mui/material';

const Register: React.FC = () => {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(email, password);
            alert('Registration successful!');
        } catch (error) {
            alert('Registration failed.');
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Register
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
                    Register
                </Button>
            </form>
        </Box>
    );
};

export default Register;