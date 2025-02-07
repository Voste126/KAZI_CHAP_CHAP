import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Expense } from './types';
import { Link } from 'react-router-dom';
import API_URL from '../utils/config';

interface ExpensesListProps {
  token: string;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ token }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/expenses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, [token]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(expenses.filter(expense => expense.expenseID !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <div>
      <h2>Expenses</h2>
      <Link to="/expense/new">Add Expense</Link>
      <ul>
        {expenses.map(expense => (
          <li key={expense.expenseID}>
            {expense.category} - ${expense.amount} on {new Date(expense.date).toLocaleDateString()}
            {' '}
            <Link to={`/expense/edit/${expense.expenseID}`}>Edit</Link>
            <button onClick={() => handleDelete(expense.expenseID)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpensesList;
