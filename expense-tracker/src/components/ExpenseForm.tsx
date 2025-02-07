import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Expense } from './types';
import { useNavigate, useParams } from 'react-router-dom';
import API_URL from '../utils/config';

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
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    if (isEdit && id) {
      axios.get(`${API_URL}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => setExpense(response.data))
      .catch(error => console.error('Error fetching expense:', error));
    }
  }, [isEdit, id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/api/expenses/${id}`, expense, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/expenses`, expense, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
      <div>
        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={expense.category}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={expense.date.split('T')[0]}
          onChange={e => {
            // Update date while keeping the time portion
            const datePart = e.target.value;
            const timePart = expense.date.split('T')[1] || '00:00:00.000Z';
            setExpense(prev => ({ ...prev, date: new Date(`${datePart}T${timePart}`).toISOString() }));
          }}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={expense.description}
          onChange={handleChange}
        />
      </div>
      <button type="submit">{isEdit ? 'Update' : 'Create'}</button>
    </form>
  );
};

export default ExpenseForm;
