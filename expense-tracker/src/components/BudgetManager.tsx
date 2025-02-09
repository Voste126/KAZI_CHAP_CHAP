// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Container,
  CssBaseline,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

interface Budget {
  budgetID: number;
  userID: number;
  category: string;
  amount: number;
  monthYear: string; // e.g., "2024-03-01T00:00:00Z"
}

const Dashboard: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [newBudget, setNewBudget] = useState<{ category: string; amount: number; monthYear: string }>({
    category: '',
    amount: 0,
    monthYear: todayStr,
  });

  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await axios.get<Budget[]>(`${API_URL}/api/budgets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBudgets(response.data);
        setLoading(false);
      } catch {
        setError('Failed to fetch budgets');
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [token]);

  const handleAddBudget = async () => {
    try {
      const budgetToSend = {
        ...newBudget,
        monthYear: newBudget.monthYear + 'T00:00:00Z',
      };
      const response = await axios.post<Budget>(
        `${API_URL}/api/budgets`,
        budgetToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBudgets([...budgets, response.data]);
      setOpenDialog(false);
      setNewBudget({ category: '', amount: 0, monthYear: todayStr });
    } catch {
      setError('Failed to add budget');
    }
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(budgets.filter((b) => b.budgetID !== id));
    } catch {
      setError('Failed to delete budget');
    }
  };

  // Compute summary data
  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
  const budgetCount = budgets.length;

  // Prepare chart data by grouping budgets by month (e.g., "Mar 2024")
  const chartDataMap: { [key: string]: number } = {};
  budgets.forEach((budget) => {
    const month = new Date(budget.monthYear).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
    chartDataMap[month] = (chartDataMap[month] || 0) + budget.amount;
  });
  const chartData = Object.entries(chartDataMap).map(([month, amount]) => ({ month, amount }));

  return (
    <>
      <CssBaseline />
      {/* Full-Screen Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', backgroundColor: themeColors.background }}>
        {/* Navbar */}
        <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Budget Manager
            </Typography>
            <Button color="inherit" onClick={() => navigate('/budget')}>Budget Manager</Button>
            <Button color="inherit" onClick={() => navigate('/expenses')}>Expenses</Button>
            <Button color="inherit" onClick={() => navigate('/')}>Back</Button>
            <Button color="inherit" onClick={() => navigate('/auth')}>Logout</Button>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth={false} sx={{ flex: 1, mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: themeColors.primary }}>
              Budget Manager Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track your budgets, monitor trends, and manage your finances effectively.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 3, backgroundColor: themeColors.accent }}>
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Total Budget
                  </Typography>
                  <Typography variant="h5" sx={{ color: themeColors.primary }}>
                    ${totalBudget.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 3, backgroundColor: themeColors.accent }}>
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Number of Budgets
                  </Typography>
                  <Typography variant="h5" sx={{ color: themeColors.primary }}>
                    {budgetCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Graph Section */}
          <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
              Budget Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke={themeColors.text} />
                <YAxis stroke={themeColors.text} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke={themeColors.primary} fill={themeColors.primary} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>

          {/* Budget Table */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
              Your Budgets
            </Typography>
            {loading ? (
              <Typography align="center">Loading...</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Month/Year</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map((budget) => (
                      <TableRow key={budget.budgetID}>
                        <TableCell>{budget.category}</TableCell>
                        <TableCell>${budget.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(budget.monthYear).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="contained" color="error" onClick={() => handleDeleteBudget(budget.budgetID)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                Add Budget
              </Button>
            </Stack>
          </Paper>
        </Container>

        {/* Add Budget Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add New Budget</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Category"
                fullWidth
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                variant="outlined"
              />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={newBudget.amount}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) || 0 })
                }
                variant="outlined"
              />
              <TextField
                label="Month/Year"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newBudget.monthYear}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, monthYear: e.target.value })
                }
                variant="outlined"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddBudget} variant="contained" color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Footer */}
        <Box sx={{ backgroundColor: '#F5F5F5', py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} KAZI CHAP CHAP. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;





