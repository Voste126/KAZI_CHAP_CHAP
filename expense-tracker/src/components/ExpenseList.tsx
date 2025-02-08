// src/components/ExpensesList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Expense } from './types';
import { useNavigate } from 'react-router-dom';
import API_URL from '../utils/config';
import {
  AppBar,
  Toolbar,
  Container,
  CssBaseline,
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

const ExpensesList: React.FC<{ token: string }> = ({ token }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Failed to fetch expenses');
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [token]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter(exp => exp.expenseID !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  // Calculate breakdown by category for PieChart.
  const expenseByCategory: { [key: string]: number } = {};
  expenses.forEach(exp => {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
  });
  const pieData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
  const pieColors = [themeColors.primary, themeColors.secondary, themeColors.accent, themeColors.text];

  // Calculate expenses over time for BarChart (grouped by date).
  const expenseByDate: { [key: string]: number } = {};
  expenses.forEach(exp => {
    const dateStr = new Date(exp.date).toLocaleDateString();
    expenseByDate[dateStr] = (expenseByDate[dateStr] || 0) + exp.amount;
  });
  const barData = Object.entries(expenseByDate).map(([date, amount]) => ({ date, amount }));

  return (
    <>
      <CssBaseline />
      {/* Full-screen layout */}
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: themeColors.background,
        }}
      >
        {/* AppBar */}
        <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: themeColors.background }}>
              Expense Tracker
            </Typography>
            <Button color="inherit" onClick={() => navigate('/expense/new')}>
              <Add fontSize="small" sx={{ mr: 0.5 }} /> Add Expense
            </Button>
            <Button color="inherit" onClick={() => navigate('/')}>
              Home
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ flex: 1, mt: 4, mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: themeColors.primary }}>
            Your Expenses
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Typography align="center" sx={{ color: themeColors.text }}>
              Loading...
            </Typography>
          ) : (
            <>
              {/* Graph Section */}
              <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                  Expense Breakdown by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>

              <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                  Expenses Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={themeColors.text} />
                    <YAxis stroke={themeColors.text} />
                    <RechartsTooltip />
                    <Bar dataKey="amount" fill={themeColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Expense Table */}
              <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                  Expense Details
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map(expense => (
                        <TableRow key={expense.expenseID}>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>${expense.amount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button variant="outlined" onClick={() => navigate(`/expense/edit/${expense.expenseID}`)}>
                                Edit
                              </Button>
                              <Button variant="outlined" color="error" onClick={() => handleDelete(expense.expenseID)}>
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Container>

        {/* Footer */}
        <Box sx={{ backgroundColor: '#F5F5F5', py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Expense Tracker. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default ExpensesList;


