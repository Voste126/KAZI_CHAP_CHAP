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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Bar,
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

// Theme colors
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [snackbarMessage] = useState('');
  const token = localStorage.getItem('jwtToken');

  // Fetch user's expenses and budgets
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, budgetsRes] = await Promise.all([
          axios.get(`${API_URL}/api/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/budgets`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        let expensesData = expensesRes.data;
        if (!Array.isArray(expensesData)) {
          expensesData = expensesData.$values ? expensesData.$values : [];
        }
        let budgetsData = budgetsRes.data;
        if (!Array.isArray(budgetsData)) {
          budgetsData = budgetsData.$values ? budgetsData.$values : [];
        }
        setExpenses(expensesData);
        setBudgets(budgetsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // --- Chart Data Calculations ---

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

  // 4. Radar Chart: Expense Radar Chart (Category Performance)
  const categories = Array.from(new Set([...Object.keys(expenseCategoryData)]));
  const radarData = categories.map((category) => {
    const totalBudget = budgets.filter(b => b.category === category).reduce((sum, b) => sum + b.amount, 0);
    const totalExpense = expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
    return { category, budget: totalBudget, expense: totalExpense };
  });

  // 5. Scatter Chart: Expense Scatter Plot (each expense by category)
  const scatterData = expenses.map(expense => ({
    category: expense.category,
    amount: expense.amount,
  }));

  // 6. Cumulative Expenses Over Time
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let cumulative = 0;
  const cumulativeData = sortedExpenses.map(expense => {
    cumulative += expense.amount;
    return { date: new Date(expense.date).toLocaleDateString(), cumulative };
  });

  // 7. Budget Utilization (Donut Chart): Used vs. Remaining
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
  const totalBudget = budgets.reduce((sum, bud) => sum + bud.amount, 0);
  const budgetRemaining = totalBudget - totalExpense > 0 ? totalBudget - totalExpense : 0;
  const utilizationData = [
    { name: 'Used', value: totalExpense },
    { name: 'Remaining', value: budgetRemaining },
  ];

  // 8. Stacked Bar Chart: Monthly Expenses by Category
  const monthlyCategoryData: { [month: string]: { [category: string]: number } } = {};
  expenses.forEach(exp => {
    const month = new Date(exp.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    if (!monthlyCategoryData[month]) monthlyCategoryData[month] = {};
    monthlyCategoryData[month][exp.category] = (monthlyCategoryData[month][exp.category] || 0) + exp.amount;
  });
  const stackedBarData = Object.entries(monthlyCategoryData).map(([month, catData]) => ({ month, ...catData }));
  const allCategories = Array.from(new Set(expenses.map(e => e.category)));

  // 9. Doughnut Chart: Budget vs Expense Distribution by Total Values
  const balance = totalBudget - totalExpense;
  const distributionData = [
    { name: "Budgets", value: totalBudget },
    { name: "Expenses", value: totalExpense },
    { name: "Balance", value: balance },
  ];

  // 10. Gauge Chart: User Budget Adherence (simulate with half‑pie)
  const adherence = totalBudget > 0 ? ((totalBudget - totalExpense) / totalBudget) * 100 : 0;
  const gaugeData = [
    { name: "Adherence", value: adherence },
    { name: "Deviation", value: 100 - adherence },
  ];

  // ---------------- UI Layout ----------------
  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/csv/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'UserCsvController.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV file:', error);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: themeColors.background,
        }}
      >
        <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              My Dashboard
            </Typography>
            <Button color="inherit" onClick={() => navigate('/expenses')}>
              Expenses
            </Button>
            <Button color="inherit" onClick={() => navigate('/budgets')}>
              Budgets
            </Button>
            <Button color="inherit" onClick={() => navigate('/')}>
              Home
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ flex: 1, mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: themeColors.primary,
                color: themeColors.background,
                '&:hover': { backgroundColor: themeColors.secondary },
              }}
              onClick={handleDownloadCSV}
            >
              Download CSV
            </Button>
          </Box>
          {loading ? (
            <Typography align="center">Loading data...</Typography>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <Typography variant="h4" align="center" gutterBottom>
                Dashboard Insights
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1">Total Expenses</Typography>
                      <Typography variant="h5">Ksh {totalExpense.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1">Total Budgets</Typography>
                      <Typography variant="h5">Ksh {totalBudget.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1">Average Expense</Typography>
                      <Typography variant="h5">Ksh {averageExpense.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1">Balance</Typography>
                      <Typography variant="h5">Ksh {balance.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Charts Grid */}
              <Grid container spacing={4}>
                {/* Chart 1: Pie Chart – Expense Breakdown by Category */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Expense Breakdown by Category 🍕
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 2: Bar Chart – Daily Expense Totals */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Daily Expense Totals
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke={themeColors.text} />
                        <YAxis stroke={themeColors.text} />
                        <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                        <Bar dataKey="amount" fill={themeColors.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 3: Line Chart – Monthly Budget vs Expense Trend */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Monthly Budget vs Expense Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" stroke={themeColors.text} />
                        <YAxis stroke={themeColors.text} />
                        <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                        <Legend />
                        <Line type="monotone" dataKey="budget" stroke={themeColors.primary} />
                        <Line type="monotone" dataKey="expense" stroke={themeColors.accent} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 4: Radar Chart – Expense Radar Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Expense Radar Chart
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" stroke={themeColors.text} />
                        <PolarRadiusAxis stroke={themeColors.text} />
                        <Radar name="Budget" dataKey="budget" stroke={themeColors.primary} fill={themeColors.primary} fillOpacity={0.6} />
                        <Radar name="Expense" dataKey="expense" stroke={themeColors.accent} fill={themeColors.accent} fillOpacity={0.6} />
                        <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 5: Scatter Chart – Expense Scatter Plot */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Expense Scatter Plot
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="category" dataKey="category" stroke={themeColors.text} />
                        <YAxis type="number" dataKey="amount" stroke={themeColors.text} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: number) => `Ksh ${value}`} />
                        <Scatter name="Expenses" data={scatterData} fill={themeColors.accent} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 6: Line Chart – Cumulative Expenses Over Time */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Cumulative Expenses Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <LineChart data={cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke={themeColors.text} />
                        <YAxis stroke={themeColors.text} />
                        <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                        <Line type="monotone" dataKey="cumulative" stroke={themeColors.primary} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 7: Doughnut Chart – Budget Utilization */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Budget Utilization
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <PieChart>
                        <Pie data={utilizationData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                          {utilizationData.map((_, index) => (
                            <Cell key={`cell-util-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 8: Stacked Bar Chart – Monthly Expenses by Category */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '400px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Monthly Expenses by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={stackedBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" stroke={themeColors.text} />
                        <YAxis stroke={themeColors.text} />
                        <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                        <Legend />
                        {allCategories.map((cat, index) => (
                          <Bar key={cat} dataKey={cat} stackId="a" fill={pieColors[index % pieColors.length]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 9: Doughnut Chart – Budget vs Expense Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      Budget vs Expense Distribution 💳
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <PieChart>
                        <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={100} label>
                          {distributionData.map((_, index) => (
                            <Cell key={`cell-dist-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number | string) => `Ksh ${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                {/* Chart 10: Gauge Chart – User Budget Adherence */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '350px' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary }}>
                      User Budget Adherence 📊
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <PieChart>
                        <Pie
                          data={gaugeData}
                          dataKey="value"
                          startAngle={180}
                          endAngle={0}
                          outerRadius={100}
                          label
                        >
                          {gaugeData.map((_, index) => (
                            <Cell key={`cell-gauge-${index}`} fill={["#82ca9d", "#ff6b6b"][index % 2]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>

              {/* Expense Details Table */}
              <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Expense Details
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amount (Ksh)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map(expense => (
                        <TableRow key={expense.expenseID}>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.amount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Container>
        <Box sx={{ backgroundColor: '#F5F5F5', py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Budget App. All rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={Boolean(snackbarOpen)}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VisualCharts;

