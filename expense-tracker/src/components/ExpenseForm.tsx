// src/components/ExpenseForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Expense } from './types';
import { useNavigate, useParams } from 'react-router-dom';
import API_URL from '../utils/config';
import {
  AppBar,
  Toolbar,
  Container,
  CssBaseline,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';

const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

interface ExpenseFormProps {
  token: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ token }) => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [expense, setExpense] = useState<Expense>({
    expenseID: 0,
    userID: 0,
    amount: 0,
    category: '',
    date: new Date().toISOString(),
    description: '',
    createdAt: new Date().toISOString(),
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      axios
        .get(`${API_URL}/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setExpense(response.data))
        .catch((error) => {
          console.error('Error fetching expense:', error);
          setErrorMsg('Error fetching expense data.');
        });
    }
  }, [isEdit, id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/api/expenses/${id}`, expense, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/expenses`, expense, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrorMsg('Error saving expense.');
    }
  };

  return (
    <>
      <CssBaseline />
      {/* AppBar */}
      <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: themeColors.background }}>
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </Typography>
          <Button color="inherit" onClick={() => navigate('/expenses')}>
            Back
          </Button>
        </Toolbar>
      </AppBar>

      {/* Full-screen layout */}
      <Box sx={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: themeColors.background }}>
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ color: themeColors.primary }}>
              {isEdit ? 'Edit Expense' : 'Add Expense'}
            </Typography>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category"
                    name="category"
                    value={expense.category}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount"
                    name="amount"
                    value={expense.amount}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    name="date"
                    InputLabelProps={{ shrink: true }}
                    value={expense.date.split('T')[0]}
                    onChange={(e) => {
                      const datePart = e.target.value;
                      const timePart = expense.date.split('T')[1] || '00:00:00.000Z';
                      setExpense(prev => ({
                        ...prev,
                        date: new Date(`${datePart}T${timePart}`).toISOString(),
                      }));
                    }}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={expense.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3 , backgroundColor: themeColors.primary, color: themeColors.background }}
              >
                {isEdit ? 'Update Expense' : 'Create Expense'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default ExpenseForm;




