// src/components/ExpenseForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  MenuItem,
  Snackbar
} from '@mui/material';

// Your theme colors
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

interface Expense {
  expenseID: number;
  userID: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  createdAt: string;
  budgetID: number;
}

interface Budget {
  budgetID: number;
  category: string;
  amount: number;
  monthYear: string;
}

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
    budgetID: 0,
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // Toast states
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Fetch budgets for dropdown
    axios
      .get(`${API_URL}/api/budgets`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let data = response.data;
        if (data && data.$values) {
          data = data.$values;
        }
        setBudgets(data);
      })
      .catch((error) => {
        console.error('Error fetching budgets:', error);
      });
  }, [token]);

  // If editing an existing expense
  useEffect(() => {
    if (isEdit && id) {
      axios
        .get(`${API_URL}/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setExpense(response.data);
        })
        .catch((error) => {
          console.error('Error fetching expense:', error);
          setToastSeverity('error');
          setToastMessage('Error fetching expense data.');
          setToastOpen(true);
        });
    }
  }, [isEdit, id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'amount' || name === 'budgetID') {
      setExpense((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setExpense((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (expense.amount < 0) {
      setToastSeverity('error');
      setToastMessage('Expense amount cannot be negative.');
      setToastOpen(true);
      return;
    }
    if (!expense.budgetID || expense.budgetID === 0) {
      setToastSeverity('error');
      setToastMessage('Please select a valid budget.');
      setToastOpen(true);
      return;
    }

    try {
      if (isEdit && id) {
        await axios.put(`${API_URL}/api/expenses/${id}`, expense, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToastSeverity('success');
        setToastMessage('Expense updated successfully!');
        setToastOpen(true);
        // Navigate after success
        setTimeout(() => navigate('/expenses'), 1500);
      } else {
        await axios.post(`${API_URL}/api/expenses`, expense, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToastSeverity('success');
        setToastMessage('Expense added successfully!');
        setToastOpen(true);
        // Navigate after success
        setTimeout(() => navigate('/expenses'), 1500);
      }
    } catch (error) {
      // If overspending or other error, we get 400
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        // This includes the overspending error + notification creation
        setToastSeverity('error');
        setToastMessage(error.response?.data || 'Failed to add expense.');
        setToastOpen(true);

        // Redirect to notifications page after short delay
        setTimeout(() => {
          navigate('/notifications');
        }, 1500);
      } else {
        console.error('Error saving expense:', error);
        setToastSeverity('error');
        setToastMessage('Error saving expense.');
        setToastOpen(true);
      }
    }
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  return (
    <>
      <CssBaseline />
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

      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: themeColors.background,
        }}
      >
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ color: themeColors.primary }}
            >
              {isEdit ? 'Edit Expense' : 'Add Expense'}
            </Typography>

            {/* Toast for errors/success */}
            <Snackbar
              open={toastOpen}
              autoHideDuration={3000}
              onClose={handleCloseToast}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }}>
                {toastMessage}
              </Alert>
            </Snackbar>

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
                    error={expense.amount < 0}
                    helperText={expense.amount < 0 ? 'Amount cannot be negative' : ''}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Budget"
                    name="budgetID"
                    value={expense.budgetID}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  >
                    <MenuItem value={0} disabled>
                      Select Budget
                    </MenuItem>
                    {budgets.map((budget) => (
                      <MenuItem key={budget.budgetID} value={budget.budgetID}>
                        {budget.category} - KSH {budget.amount.toFixed(2)} -{' '}
                        {new Date(budget.monthYear).toLocaleDateString()}
                      </MenuItem>
                    ))}
                  </TextField>
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
                      setExpense((prev) => ({
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
                sx={{
                  mt: 3,
                  backgroundColor: themeColors.primary,
                  color: '#fff',
                  '&:hover': { backgroundColor: themeColors.secondary },
                }}
                disabled={expense.amount < 0 || expense.budgetID === 0}
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

