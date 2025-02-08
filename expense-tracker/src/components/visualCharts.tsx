// src/components/visualCharts.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Container,
  CssBaseline,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Button,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
} from 'recharts';
import API_URL from '../utils/config';

// Define your theme colors
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
}

interface Budget {
  budgetID: number;
  userID: number;
  category: string;
  amount: number;
  monthYear: string;
}

const VisualCharts: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  // Fetch expenses and budgets concurrently
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, budgetsRes] = await Promise.all([
          axios.get(`${API_URL}/api/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/budgets`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setExpenses(expensesRes.data);
        setBudgets(budgetsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // ----- Chart Data Calculations -----

  // 1. Pie Chart: Expense Breakdown by Category
  const expenseCategoryData = expenses.reduce((acc: { [key: string]: number }, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  const pieData = Object.entries(expenseCategoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
  const pieColors = [themeColors.primary, themeColors.secondary, themeColors.accent, themeColors.text];

  // 2. Bar Chart: Daily Expense Totals
  const expenseDateData = expenses.reduce((acc: { [key: string]: number }, expense) => {
    const date = new Date(expense.date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});
  const barData = Object.entries(expenseDateData).map(([date, amount]) => ({ date, amount }));

  // 3. Line Chart: Monthly Budget vs Expense Trend
  const budgetMonthData = budgets.reduce((acc: { [key: string]: number }, budget) => {
    const month = new Date(budget.monthYear).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + budget.amount;
    return acc;
  }, {});
  const expenseMonthData = expenses.reduce((acc: { [key: string]: number }, expense) => {
    const month = new Date(expense.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {});
  const months = Array.from(new Set([...Object.keys(budgetMonthData), ...Object.keys(expenseMonthData)]));
  const lineData = months.map((month) => ({
    month,
    budget: budgetMonthData[month] || 0,
    expense: expenseMonthData[month] || 0,
  }));

  // 4. Radar Chart: Category Performance (Budget vs Expense)
  const categories = Array.from(
    new Set([...budgets.map((b) => b.category), ...expenses.map((e) => e.category)])
  );
  const radarData = categories.map((category) => {
    const totalBudget = budgets.filter((b) => b.category === category).reduce((sum, b) => sum + b.amount, 0);
    const totalExpense = expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0);
    return { category, budget: totalBudget, expense: totalExpense };
  });

  // 5. Scatter Chart: Each Expense by Category (x: category, y: amount)
  const scatterData = expenses.map((expense) => ({
    category: expense.category,
    amount: expense.amount,
  }));

  // ----- End Chart Data Calculations -----

  // Function to delete an expense
  const handleDeleteExpense = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(expenses.filter((exp) => exp.expenseID !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

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
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Visual Dashboard
            </Typography>
            <Button color="inherit" onClick={() => navigate('/budget')}>
              Budget Manager
            </Button>
            <Button color="inherit" onClick={() => navigate('/expenses')}>
              Expenses
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ flex: 1, mt: 4, mb: 4 }}>
          {loading ? (
            <Typography align="center">Loading data...</Typography>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <Typography variant="h4" align="center" gutterBottom>
                Dashboard Insights
              </Typography>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* Pie Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, boxShadow: 3, height: '350px' }}>
                    <Typography variant="h6" gutterBottom>
                      Expense Breakdown by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
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
                </Grid>

                {/* Bar Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, boxShadow: 3, height: '350px' }}>
                    <Typography variant="h6" gutterBottom>
                      Daily Expense Totals
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke={themeColors.text} />
                        <YAxis stroke={themeColors.text} />
                        <RechartsTooltip />
                        <Bar dataKey="amount" fill={themeColors.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Line Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, boxShadow: 3, height: '350px' }}>
                    <Typography variant="h6" gutterBottom>
                      Monthly Budget vs Expense Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" stroke={themeColors.text} />
                        <YAxis stroke={themeColors.text} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="budget" stroke={themeColors.primary} />
                        <Line type="monotone" dataKey="expense" stroke={themeColors.accent} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Radar Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, boxShadow: 3, height: '350px' }}>
                    <Typography variant="h6" gutterBottom>
                      Category Performance (Budget vs Expense)
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" stroke={themeColors.text} />
                        <PolarRadiusAxis stroke={themeColors.text} />
                        <Radar
                          name="Budget"
                          dataKey="budget"
                          stroke={themeColors.primary}
                          fill={themeColors.primary}
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Expense"
                          dataKey="expense"
                          stroke={themeColors.accent}
                          fill={themeColors.accent}
                          fillOpacity={0.6}
                        />
                        <RechartsTooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Scatter Chart */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, boxShadow: 3, height: '350px' }}>
                    <Typography variant="h6" gutterBottom>
                      Expense Scatter Plot
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="category" dataKey="category" name="Category" stroke={themeColors.text} />
                        <YAxis type="number" dataKey="amount" name="Amount" stroke={themeColors.text} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Expenses" data={scatterData} fill={themeColors.accent} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>

              {/* Expense Table */}
              <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Expense Details
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
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
                              <Button variant="outlined" color="error" onClick={() => handleDeleteExpense(expense.expenseID)}>
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
            &copy; {new Date().getFullYear()} Budget App. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default VisualCharts;

