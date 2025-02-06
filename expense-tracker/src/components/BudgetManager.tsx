import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import API_URL from '../utils/config';

interface Budget {
  budgetID: number;
  userID: number;
  category: string;
  amount: number;
  monthYear: string; // ISO date string (e.g. "2024-03-01T00:00:00Z")
}

const BudgetManager: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  // Initialize monthYear with today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const [newBudget, setNewBudget] = useState<{ category: string; amount: number; monthYear: string }>({
    category: '',
    amount: 0,
    monthYear: todayStr,
  });

  const token = localStorage.getItem('jwtToken');

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
      // Append time to date string to produce a full ISO date if needed
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

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Budget Manager
      </Typography>
      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper sx={{ padding: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Month/Year</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.budgetID}>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>{budget.amount}</TableCell>
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
          <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} sx={{ marginTop: 2 }}>
            Add Budget
          </Button>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Budget</DialogTitle>
        <DialogContent>
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            value={newBudget.category}
            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={newBudget.amount}
            onChange={(e) => setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) || 0 })}
          />
          <TextField
            label="Month/Year"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newBudget.monthYear}
            onChange={(e) => setNewBudget({ ...newBudget, monthYear: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddBudget} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BudgetManager;

