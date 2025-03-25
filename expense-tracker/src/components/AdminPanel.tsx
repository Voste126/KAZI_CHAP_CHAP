import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Toolbar,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  MenuItem,
  Snackbar,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  
  InputAdornment,
  IconButton, 
} from '@mui/material';
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import API_URL from '../utils/config';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Theme colors
const themeColors = {
  primary: '#006400',   // Dark Green
  secondary: '#8B4513', // Saddle Brown
  background: '#F5F5DC',// Beige
  text: '#2F4F4F',      // Dark Slate Gray
  accent: '#FFD700',    // Gold
};

// Data models
interface Expense {
  expenseID: number;
  userID: number;
  budgetID: number;
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Budget {
  budgetID: number;
  userID: number;
  category: string;
  amount: number;
  monthYear: string; // e.g., "2024-03-01T00:00:00Z"
}

interface User {
  userID: number;
  email: string;
  passwordHash: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  gender: string;
  password?: string;
}

const AdminPanel: React.FC<{ token: string }> = ({ token }) => {
  const navigate = useNavigate();

  // Tabs and data states
  const [activeTab, setActiveTab] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Analytics filter state – "all" or a specific userID
  const [analyticsUser, setAnalyticsUser] = useState<number | "all">("all");

  // Dialog state for add/edit
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<'expense' | 'budget' | 'user' | null>(null);
  const [formData, setFormData] = useState<Partial<Expense | Budget | User>>({});

  // Delete confirmation state
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [deleteRecord, setDeleteRecord] = useState<{ type: 'expense' | 'budget' | 'user'; id: number } | null>(null);

  // Snackbar (toast) state for notifications
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">("success");

  // Data fetching function
  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, budgetsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/AdminPanel/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/AdminPanel/budgets`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/AdminPanel/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      let expensesData = expensesRes.data;
      if (expensesData && expensesData.$values) expensesData = expensesData.$values;
      setExpenses(expensesData);

      let budgetsData = budgetsRes.data;
      if (budgetsData && budgetsData.$values) budgetsData = budgetsData.$values;
      setBudgets(budgetsData);

      let usersData = usersRes.data;
      if (usersData && usersData.$values) usersData = usersData.$values;
      const processedUsers = usersData.map((user: User) => {
        if (user.password) delete user.password;
        return user;
      });
      setUsers(processedUsers);
    } catch {
      setError('Failed to fetch data for the admin panel.');
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date change handlers
  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setFormData(prev => ({ ...prev, monthYear: utcDate.toISOString() }));
  };

  const handleExpenseDateChange = (date: Date | null) => {
    if (!date) return;
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setFormData(prev => ({ ...prev, date: utcDate.toISOString() }));
  };

  const handleOpenDialog = (type: 'expense' | 'budget' | 'user', initialData: Partial<Expense | Budget | User> = {}) => {
    setDialogType(type);
    setFormData(initialData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if ((dialogType === 'expense' || dialogType === 'budget') && (formData as Expense | Budget).amount! < 0) {
        setError('Amount cannot be negative.');
        return;
      }
      if (dialogType === 'expense') {
        if ((formData as Expense).expenseID) {
          await axios.put(
            `${API_URL}/api/AdminPanel/expenses/${(formData as Expense).expenseID}`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${API_URL}/api/AdminPanel/expenses`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else if (dialogType === 'budget') {
        if ((formData as Budget).budgetID) {
          await axios.put(
            `${API_URL}/api/AdminPanel/budgets/${(formData as Budget).budgetID}`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${API_URL}/api/AdminPanel/budgets`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else if (dialogType === 'user') {
        if ((formData as User).userID) {
          await axios.put(
            `${API_URL}/api/AdminPanel/users/${(formData as User).userID}`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${API_URL}/api/AdminPanel/users`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
      handleCloseDialog();
      fetchData();
      setSnackbarMessage("Record saved successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      if (dialogType === 'expense' && axios.isAxiosError(err) && err.response) {
        setSnackbarMessage(err.response.data);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } else {
        setError('Failed to save the record.');
      }
    }
  };

  const confirmDelete = (type: 'expense' | 'budget' | 'user', id: number) => {
    setDeleteRecord({ type, id });
    setOpenDeleteConfirm(true);
  };

  const handleDelete = async (type: 'expense' | 'budget' | 'user', id: number) => {
    try {
      if (type === 'expense') {
        await axios.delete(`${API_URL}/api/AdminPanel/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else if (type === 'budget') {
        await axios.delete(`${API_URL}/api/AdminPanel/budgets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else if (type === 'user') {
        await axios.delete(`${API_URL}/api/AdminPanel/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchData();
      setSnackbarMessage("Record deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch {
      setError('Failed to delete the record.');
    }
  };

  // ================= Analytics Data Preparation =================
  // Filter data by selected analytics user if applicable.
  const filteredExpenses = analyticsUser === "all" 
    ? expenses 
    : expenses.filter(exp => exp.userID === analyticsUser);
  const filteredBudgets = analyticsUser === "all" 
    ? budgets 
    : budgets.filter(bud => bud.userID === analyticsUser);

  const totalExpense = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalBudget = filteredBudgets.reduce((acc, bud) => acc + bud.amount, 0);
  const averageExpense = filteredExpenses.length ? totalExpense / filteredExpenses.length : 0;
  const balance = totalBudget - totalExpense;

  // Expense breakdown by category for filtered data.
  const expenseByCategory: { [key: string]: number } = {};
  filteredExpenses.forEach(exp => {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
  });
  const pieData = Object.entries(expenseByCategory).map(([category, value]) => ({ name: category, value }));
  const pieColors = [themeColors.primary, themeColors.secondary, themeColors.accent, themeColors.text];

  // Monthly expenses for filtered data.
  const monthlyExpensesMap: { [month: string]: number } = {};
  filteredExpenses.forEach(exp => {
    const month = new Date(exp.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    monthlyExpensesMap[month] = (monthlyExpensesMap[month] || 0) + exp.amount;
  });
  const monthlyExpensesData = Object.entries(monthlyExpensesMap).map(([month, total]) => ({ month, total }));

  // Simulated monthly income: expense + 20,000 for demonstration.
  const monthlyIncomeData = monthlyExpensesData.map(item => ({
    month: item.month,
    income: item.total + 20000,
    expense: item.total
  }));

  // Radar chart data for expense categories.
  const radarData = Object.entries(expenseByCategory).map(([category, total]) => ({ category, total }));

  // ================= Users Filtering =================
  const filteredUsers = users.filter(user => {
    const nameMatch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchName.toLowerCase())
      || user.email.toLowerCase().includes(searchName.toLowerCase());
    const genderMatch = filterGender ? user.gender === filterGender : true;
    return nameMatch && genderMatch;
  });
  // ===================================================================

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: themeColors.background }}>
      <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              color: themeColors.primary,
              borderColor: themeColors.primary,
              backgroundColor: themeColors.background,
              textTransform: 'none',
              '&:hover': { backgroundColor: themeColors.accent },
            }}
          >
            Back Home
          </Button>
        </Toolbar>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
        >
          <Tab label="Analytics" />
          <Tab label="Expenses" />
          <Tab label="Budgets" />
          <Tab label="Users" />
        </Tabs>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* ===================== Analytics Tab ===================== */}
        {activeTab === 0 && (
          <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: themeColors.primary }}>
                Filter by User:
              </Typography>
              <TextField
                select
                label="User"
                value={analyticsUser === "all" ? "all" : analyticsUser}
                onChange={(e) => setAnalyticsUser(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                variant="outlined"
                size="small"
              >
                <MenuItem value="all">All Users</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.userID} value={user.userID}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Typography variant="h4" gutterBottom sx={{ color: themeColors.primary }}>
              Analytics Dashboard
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1">Total Expenses</Typography>
                <Typography variant="h5">Ksh {totalExpense.toFixed(2)}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1">Total Budgets</Typography>
                <Typography variant="h5">Ksh {totalBudget.toFixed(2)}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1">Average Expense</Typography>
                <Typography variant="h5">Ksh {averageExpense.toFixed(2)}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1">Balance</Typography>
                <Typography variant="h5">Ksh {balance.toFixed(2)}</Typography>
              </Paper>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {/* Chart 1: Monthly Expense Breakdown (Pie Chart) 🍕 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Monthly Expense Breakdown 🍕
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 2: Expense Trends Over Time (Line Chart) 📈 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Expense Trends Over Time 📈
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={monthlyExpensesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `Ksh ${value}`} />
                    <RechartsTooltip formatter={(value: number) => `Ksh ${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke={themeColors.accent} strokeWidth={2} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 3: Income vs. Expenses (Bar Chart) 💰 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Income vs. Expenses 💰
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={monthlyIncomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `Ksh ${value}`} />
                    <RechartsTooltip formatter={(value: number | string) => `Ksh ${value}`} />
                    <Legend />
                    <Bar dataKey="income" fill={themeColors.primary} name="Income" />
                    <Bar dataKey="expense" fill={themeColors.secondary} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 4: Savings Progress (Progress Bar) 🎯 */}
              <Paper sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Savings Progress 🎯
                </Typography>
                {(() => {
                  const savingGoal = 100000; // Ksh 100,000 goal
                  // Simulate total income as totalBudget * 1.1 for demo purposes
                  const totalIncome = totalBudget * 1.1;
                  const savings = totalIncome - totalExpense;
                  const progress = Math.min((savings / savingGoal) * 100, 100);
                  return (
                    <>
                      <Typography variant="body1">Savings: Ksh {savings.toFixed(2)} / {savingGoal}</Typography>
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, backgroundColor: '#ddd' }} />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>{progress.toFixed(2)}% of goal achieved</Typography>
                    </>
                  );
                })()}
              </Paper>

              {/* Chart 5: Cash Flow Statement (Stacked Bar Chart) 🔄 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Cash Flow Statement 🔄
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={monthlyIncomeData} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `Ksh ${value}`} />
                    <RechartsTooltip formatter={(value: number | string) => `Ksh ${value}`} />
                    <Legend />
                    <Bar dataKey="income" stackId="a" fill={themeColors.primary} name="Income" />
                    <Bar dataKey="expense" stackId="a" fill={themeColors.secondary} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 6: Expense Forecast (Area Chart) 🔮 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Expense Forecast 🔮
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={
                    (() => {
                      const forecastData = [...monthlyExpensesData];
                      if (forecastData.length > 0) {
                        const last = forecastData[forecastData.length - 1];
                        const forecastExpense = last.total * 1.1;
                        forecastData.push({ month: "Forecast", total: forecastExpense });
                      }
                      return forecastData;
                    })()
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `Ksh ${value}`} />
                    <RechartsTooltip formatter={(value: number | string) => `Ksh ${value}`} />
                    <Legend />
                    <Area type="monotone" dataKey="total" stroke={themeColors.accent} fill={themeColors.accent} name="Forecasted Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 7: Top Expense Categories (Horizontal Bar Chart) 🏆 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Top Expense Categories 🏆
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart layout="vertical" data={
                    (() => {
                      const categories = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
                      categories.sort((a, b) => b.value - a.value);
                      return categories;
                    })()
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `Ksh ${value}`} />
                    <YAxis dataKey="name" type="category" />
                    <RechartsTooltip formatter={(value: number | string) => `Ksh ${value}`} />
                    <Legend />
                    <Bar dataKey="value" fill={themeColors.secondary} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 8: Budget vs Expense Distribution by Total Values (Doughnut Chart) 💳 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Budget vs Expense Distribution 💳
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Budgets", value: totalBudget },
                        { name: "Expenses", value: totalExpense },
                        { name: "Balance", value: balance }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={80}
                      label
                    >
                      {["#8884d8", "#82ca9d", "#ffc658"].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number | string) => `Ksh ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 9: Expense Radar Chart (Radar Chart) */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  Expense Radar Chart
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, Math.max(...Object.values(expenseByCategory))]} />
                    <Radar name="Expenses" dataKey="total" stroke={themeColors.accent} fill={themeColors.accent} fillOpacity={0.6} />
                    <RechartsTooltip formatter={(value: number | string) => `Ksh ${value}`} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>

              {/* Chart 10: User Budget Adherence (Gauge Chart) 📊 */}
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" sx={{ color: themeColors.primary, mb: 1 }}>
                  User Budget Adherence 📊
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    {(() => {
                      const adherence = totalBudget > 0 ? ((totalBudget - totalExpense) / totalBudget) * 100 : 0;
                      return (
                        <Pie
                          data={[
                            { name: "Adherence", value: adherence },
                            { name: "Deviation", value: 100 - adherence },
                          ]}
                          dataKey="value"
                          startAngle={180}
                          endAngle={0}
                          outerRadius={80}
                          label
                        >
                          {["#82ca9d", "#ff6b6b"].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                      );
                    })()}
                    <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Box>
          </Box>
        )}

        {/* ===================== Expenses Tab ===================== */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: themeColors.primary }}>
              Manage Expenses
            </Typography>
            <Button variant="contained" sx={{ mb: 2, backgroundColor: themeColors.primary }} onClick={() => handleOpenDialog('expense')}>
              Add Expense
            </Button>
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map(exp => (
                      <TableRow key={exp.expenseID}>
                        <TableCell>{exp.expenseID}</TableCell>
                        <TableCell>{exp.category}</TableCell>
                        <TableCell>Ksh {(exp.amount ?? 0).toFixed(2)}</TableCell>
                        <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                        <TableCell>{exp.description}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => handleOpenDialog('expense', exp)}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => confirmDelete('expense', exp.expenseID)}>
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
          </Box>
        )}

        {/* ===================== Budgets Tab ===================== */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: themeColors.primary }}>
              Manage Budgets
            </Typography>
            <Button variant="contained" sx={{ mb: 2, backgroundColor: themeColors.primary }} onClick={() => handleOpenDialog('budget')}>
              Add Budget
            </Button>
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Month/Year</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map(bud => (
                      <TableRow key={bud.budgetID}>
                        <TableCell>{bud.budgetID}</TableCell>
                        <TableCell>{bud.category}</TableCell>
                        <TableCell>Ksh {(bud.amount ?? 0).toFixed(2)}</TableCell>
                        <TableCell>{new Date(bud.monthYear).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => handleOpenDialog('budget', bud)}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => confirmDelete('budget', bud.budgetID)}>
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
          </Box>
        )}

        {/* ===================== Users Tab ===================== */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: themeColors.primary }}>
              Manage Users
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Search by Name"
                variant="outlined"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <TextField
                select
                label="Filter by Gender"
                variant="outlined"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Stack>
            <Button variant="contained" sx={{ mb: 2, backgroundColor: themeColors.primary }} onClick={() => handleOpenDialog('user')}>
              Add User
            </Button>
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>First Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Last Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Password Hash</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Created At</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.userID}>
                        <TableCell>{user.userID}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                        <TableCell>{user.gender}</TableCell>
                        <TableCell>{user.passwordHash}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => handleOpenDialog('user', user)}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => confirmDelete('user', user.userID)}>
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
          </Box>
        )}
      </Box>

      {/* Dialog for Creating/Editing a Record */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogType ? `Add / Edit ${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}` : ''}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'expense' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Category"
                fullWidth
                value={(formData as Expense).category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                variant="outlined"
              />
              {/* Dropdown for selecting user */}
              <TextField
                select
                label="User"
                fullWidth
                value={(formData as Expense).userID || ''}
                onChange={(e) => {
                  const selectedUser = parseInt(e.target.value);
                  setFormData({ ...formData, userID: selectedUser, budgetID: undefined });
                }}
                variant="outlined"
              >
                {users.map(user => (
                  <MenuItem key={user.userID} value={user.userID}>
                    {user.userID} - {user.email}
                  </MenuItem>
                ))}
              </TextField>
              {/* Dropdown for selecting budget filtered by selected user */}
              <TextField
                select
                label="Budget"
                fullWidth
                value={(formData as Expense).budgetID || ''}
                onChange={(e) => setFormData({ ...formData, budgetID: parseInt(e.target.value) })}
                variant="outlined"
              >
                {budgets
                  .filter(budget => budget.userID === (formData as Expense).userID)
                  .map(budget => (
                    <MenuItem key={budget.budgetID} value={budget.budgetID}>
                      {budget.budgetID} - {budget.category} (Ksh {budget.amount})
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={(formData as Expense).amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                variant="outlined"
                error={(formData as Expense).amount! < 0}
                helperText={(formData as Expense).amount! < 0 ? 'Amount cannot be negative' : ''}
              />
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={(formData as Expense).date ? (formData as Expense).date.split('T')[0] : ''}
                onChange={(e) => handleExpenseDateChange(new Date(e.target.value))}
                variant="outlined"
              />
              <TextField
                label="Description"
                fullWidth
                value={(formData as Expense).description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                variant="outlined"
              />
            </Stack>
          )}
          {(dialogType === 'budget') && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Category"
                fullWidth
                value={(formData as Budget).category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                variant="outlined"
              />
              {/* Dropdown for selecting user */}
              <TextField
                select
                label="User"
                fullWidth
                value={(formData as Budget).userID || ''}
                onChange={(e) => setFormData({ ...formData, userID: parseInt(e.target.value) })}
                variant="outlined"
              >
                {users.map(user => (
                  <MenuItem key={user.userID} value={user.userID}>
                    {user.userID} - {user.email}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={(formData as Budget).amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                variant="outlined"
                error={(formData as Budget).amount! < 0}
                helperText={(formData as Budget).amount! < 0 ? 'Amount cannot be negative' : ''}
              />
              <TextField
                label="Month/Year"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={(formData as Budget).monthYear ? (formData as Budget).monthYear.split('T')[0] : ''}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                variant="outlined"
              />
            </Stack>
          )}
          {dialogType === 'user' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="First Name"
                fullWidth
                value={(formData as User).firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                variant="outlined"
              />
              <TextField
                label="Last Name"
                fullWidth
                value={(formData as User).lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                variant="outlined"
              />
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  value={(formData as User).gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
              <TextField
                label="Email"
                fullWidth
                value={(formData as User).email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                variant="outlined"
              />
              {!(formData as User).userID && (
                <>
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    value={(formData as Partial<User>).password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    variant="outlined"
                    error={
                      !!(formData as Partial<User>).password &&
                      !(
                        ((formData as Partial<User>).password ?? '').length >= 8 &&
                        /[a-z]/.test((formData as Partial<User>).password ?? '') &&
                        /[A-Z]/.test((formData as Partial<User>).password ?? '') &&
                        /[!@#$%^&*(),.?":{}|<>]/.test((formData as Partial<User>).password ?? '')
                      )
                    }
                    helperText="Password must meet all criteria below."
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* Password criteria list */}
                  {(() => {
                    const password = (formData as Partial<User>).password || '';
                    const isMinLength = password.length >= 8;
                    const hasLower = /[a-z]/.test(password);
                    const hasUpper = /[A-Z]/.test(password);
                    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                    return (
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ color: isMinLength ? 'green' : 'red' }}>
                          {isMinLength ? '✓' : '✗'} Minimum 8 characters
                        </Typography>
                        <Typography variant="body2" sx={{ color: hasLower ? 'green' : 'red' }}>
                          {hasLower ? '✓' : '✗'} Contains lowercase letter
                        </Typography>
                        <Typography variant="body2" sx={{ color: hasUpper ? 'green' : 'red' }}>
                          {hasUpper ? '✓' : '✗'} Contains uppercase letter
                        </Typography>
                        <Typography variant="body2" sx={{ color: hasSpecial ? 'green' : 'red' }}>
                          {hasSpecial ? '✓' : '✗'} Contains special character
                        </Typography>
                      </Stack>
                    );
                  })()}
                </>
              )}
            </Stack>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={(dialogType === 'expense' || dialogType === 'budget') && (formData as Expense | Budget).amount! < 0}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (deleteRecord) {
                handleDelete(deleteRecord.type, deleteRecord.id);
                setOpenDeleteConfirm(false);
                setSnackbarMessage("Record deleted successfully");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
              }
            }}
            variant="contained"
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;

