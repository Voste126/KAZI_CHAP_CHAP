// src/components/AdminPanel.tsx
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

// Updated User model with additional fields.
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

  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter states for users
  const [searchName, setSearchName] = useState('');
  const [filterGender, setFilterGender] = useState('');

  // Dialog state for add/edit
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<'expense' | 'budget' | 'user' | null>(null);
  const [formData, setFormData] = useState<Partial<Expense | Budget | User>>({});

  // Delete confirmation state
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [deleteRecord, setDeleteRecord] = useState<{ type: 'expense' | 'budget' | 'user'; id: number } | null>(null);

  // Snackbar state for deletion confirmation
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // Data fetching function
  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, budgetsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/AdminPanel/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/AdminPanel/budgets`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/AdminPanel/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      let expensesData = expensesRes.data;
      if (expensesData && expensesData.$values) {
        expensesData = expensesData.$values;
      }
      setExpenses(expensesData);

      let budgetsData = budgetsRes.data;
      if (budgetsData && budgetsData.$values) {
        budgetsData = budgetsData.$values;
      }
      setBudgets(budgetsData);

      let usersData = usersRes.data;
      if (usersData && usersData.$values) {
        usersData = usersData.$values;
      }
      // Remove the password field if present
      const processedUsers = usersData.map((user: User) => {
        if (user.password) {
          delete user.password;
        }
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

  // Date change handlers for budgets/expenses
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
      // Validate non-negative amounts for expense and budget
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
    } catch {
      setError('Failed to save the record.');
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

  // Additional analytics calculations
  const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalBudget = budgets.reduce((acc, bud) => acc + bud.amount, 0);
  const averageExpense = expenses.length ? totalExpense / expenses.length : 0;

  const monthlyExpensesMap: { [month: string]: number } = {};
  expenses.forEach(exp => {
    const month = new Date(exp.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    monthlyExpensesMap[month] = (monthlyExpensesMap[month] || 0) + exp.amount;
  });
  const monthlyExpensesData = Object.entries(monthlyExpensesMap).map(([month, total]) => ({ month, total }));
  // ===================================================================

  // Filter the users based on search text and selected gender
  const filteredUsers = users.filter(user => {
    const nameMatch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchName.toLowerCase())
      || user.email.toLowerCase().includes(searchName.toLowerCase());
    const genderMatch = filterGender ? user.gender === filterGender : true;
    return nameMatch && genderMatch;
  });

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
              '&:hover': {
                backgroundColor: themeColors.accent,
              },
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
            <Typography variant="h4" gutterBottom sx={{ color: themeColors.primary }}>
              Analytics Dashboard
            </Typography>

            {/* Summary Metrics */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1">Total Expenses</Typography>
                <Typography variant="h5">${totalExpense.toFixed(2)}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1">Total Budgets</Typography>
                <Typography variant="h5">${totalBudget.toFixed(2)}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1">Average Expense</Typography>
                <Typography variant="h5">${averageExpense.toFixed(2)}</Typography>
              </Paper>
            </Stack>

            {/* Expense Breakdown by Category (Pie Chart) */}
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

            {/* Monthly Expenses (Bar Chart) */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Monthly Expenses (Bar Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyExpensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total" fill={themeColors.secondary} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Expense Trend (Line Chart) */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary }}>
                Expense Trend (Line Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyExpensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke={themeColors.accent} strokeWidth={2} name="Expenses Trend" />
                </LineChart>
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
                        <TableCell>${(bud.amount ?? 0).toFixed(2)}</TableCell>
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
            {/* Filter controls */}
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
                value={(formData as Expense | Budget).category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                variant="outlined"
              />
              {/* Dropdown for selecting user */}
              <TextField
                select
                label="User"
                fullWidth
                value={(formData as Expense).userID || ''}
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
                value={(formData as Expense | Budget).amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                variant="outlined"
                error={(formData as Expense | Budget).amount! < 0}
                helperText={(formData as Expense | Budget).amount! < 0 ? 'Amount cannot be negative' : ''}
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
                value={(formData as Expense | Budget).amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                variant="outlined"
                error={(formData as Expense | Budget).amount! < 0}
                helperText={(formData as Expense | Budget).amount! < 0 ? 'Amount cannot be negative' : ''}
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

      {/* Snackbar for deletion confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default AdminPanel;

