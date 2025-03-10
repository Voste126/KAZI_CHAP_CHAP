// src/components/AdminPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  ComposedChart,
  Treemap,
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

// Data models
interface Expense {
  expenseID: number;
  userID: number;
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
  role: string;
  password?: string;
}

const AdminPanel: React.FC<{ token: string }> = ({ token }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State for the Add/Edit dialog
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<'expense' | 'budget' | 'user' | null>(null);
  const [formData, setFormData] = useState<Partial<Expense | Budget | User>>({});

  // Data fetching function—declared using useCallback to avoid unnecessary re-creation.
  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, budgetsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/AdminPanel/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/AdminPanel/budgets`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/AdminPanel/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setExpenses(expensesRes.data);
      setBudgets(budgetsRes.data);
      setUsers(usersRes.data);
    } catch {
      setError('Failed to fetch data for the admin panel.');
    }
  }, [token]);

  // Fetch data on component mount and when token changes.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers for date change
  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setFormData(prev => ({
      ...prev,
      monthYear: utcDate.toISOString(),
    }));
  };

  const handleExpenseDateChange = (date: Date | null) => {
    if (!date) return;
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setFormData(prev => ({
      ...prev,
      date: utcDate.toISOString(),
    }));
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
      // Re-fetch data to ensure the UI displays the updated record.
      fetchData();
    } catch {
      setError('Failed to save the record.');
    }
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
      // Re-fetch data after deletion.
      fetchData();
    } catch {
      setError('Failed to delete the record.');
    }
  };

  // ================= Analytics Data Preparation =================
  const expenseByCategory: { [key: string]: number } = {};
  expenses.forEach(exp => {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
  });
  const pieData = Object.entries(expenseByCategory).map(([category, value]) => ({ name: category, value }));
  const pieColors = [themeColors.primary, themeColors.secondary, themeColors.accent, themeColors.text];

  const monthlyExpensesData = Object.entries(
    expenses.reduce((acc: { [month: string]: number }, curr) => {
      const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
      const monthYear = new Date(curr.date).toLocaleDateString(undefined, options);
      acc[monthYear] = (acc[monthYear] || 0) + curr.amount;
      return acc;
    }, {})
  ).map(([month, total]) => ({ month, total }));

  const radarData = Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount }));
  const treemapData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  // ===================================================================

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: themeColors.background }}>
      <AppBar position="static" sx={{ backgroundColor: themeColors.primary }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
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
            <Typography variant="h4" gutterBottom sx={{ color: themeColors.primary }}>
              Analytics Dashboard
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Expense Breakdown by Category (Pie Chart)
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

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Expenses Per Month (Bar Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyExpensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total" fill={themeColors.primary} name="Total Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Expense Trend Over Time (Line Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyExpensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke={themeColors.secondary} strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Expense Distribution (Radar Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar name="Expenses" dataKey="amount" stroke={themeColors.accent} fill={themeColors.accent} fillOpacity={0.6} />
                  <Legend />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Cumulative Expenses (Area Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyExpensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColors.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={themeColors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="total" stroke={themeColors.primary} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Combined Chart (Bar & Line)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyExpensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total" barSize={20} fill={themeColors.secondary} />
                  <Line type="monotone" dataKey="total" stroke={themeColors.accent} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Expense Distribution (Treemap)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <Treemap data={treemapData} dataKey="value" stroke="#fff" fill={themeColors.primary} />
              </ResponsiveContainer>
            </Paper>
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
                        <TableCell>${(exp.amount ?? 0).toFixed(2)}</TableCell>
                        <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                        <TableCell>{exp.description}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => handleOpenDialog('expense', exp)}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => handleDelete('expense', exp.expenseID)}>
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
                        <TableCell>${(bud.amount ?? 0).toFixed(2)}</TableCell>
                        <TableCell>{new Date(bud.monthYear).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => handleOpenDialog('budget', bud)}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => handleDelete('budget', bud.budgetID)}>
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
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.userID}>
                        <TableCell>{user.userID}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => handleOpenDialog('user', user)}>
                              Edit
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => handleDelete('user', user.userID)}>
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
                value={(formData as Expense | Budget).category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                variant="outlined"
              />
              <TextField
                label="User ID"
                type="number"
                fullWidth
                value={(formData as Expense).userID || ''}
                onChange={(e) => setFormData({ ...formData, userID: parseInt(e.target.value) })}
                variant="outlined"
              />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={(formData as Expense | Budget).amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                variant="outlined"
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
          {dialogType === 'budget' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Category"
                fullWidth
                value={(formData as Expense | Budget).category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                variant="outlined"
              />
              <TextField
                label="User ID"
                type="number"
                fullWidth
                value={(formData as Budget).userID || ''}
                onChange={(e) => setFormData({ ...formData, userID: parseInt(e.target.value) })}
                variant="outlined"
              />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={(formData as Expense | Budget).amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                variant="outlined"
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
                label="Email"
                fullWidth
                value={(formData as User).email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                variant="outlined"
              />
              {!(formData as User).userID && (
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={(formData as Partial<User>).password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;

