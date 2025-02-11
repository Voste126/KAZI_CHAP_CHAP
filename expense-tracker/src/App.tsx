// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthForm from './components/Auth/AuthForm';
import NotFound from './pages/NotFound';
import Dashboard from './components/BudgetManager';
import ExpensesList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Home from './pages/Home';
import VisualCharts from './components/visualCharts';
import About from './pages/About';
import Logout from './components/Auth/Logout';
import AdminPanel from './components/AdminPanel';

interface JwtPayload {
  exp: number;
  email: string;
  role: string;
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      isAdmin = decoded.role === 'Admin';
    } catch (error) {
      console.error('Invalid token', error);
      isAdmin = false;
    }
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthForm setToken={setToken} />} />
        <Route path="/login" element={<AuthForm setToken={setToken} />} />
        <Route path="/budget" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Home />} />
        <Route path="/visual" element={<VisualCharts />} />

        {/* Protected Routes */}
        {token ? (
          <>
            <Route path="/expenses" element={<ExpensesList token={token} />} />
            <Route path="/expense/new" element={<ExpenseForm token={token} />} />
            <Route path="/expense/edit/:id" element={<ExpenseForm token={token} />} />
            {isAdmin && <Route path="/admin" element={<AdminPanel token={token} />} />}
            <Route path="/logout" element={<Logout setToken={setToken} />} />
            {/* Fallback: if admin, redirect to /admin; otherwise to /expenses */}
            <Route path="*" element={<Navigate to={isAdmin ? "/admin" : "/expenses"} replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
        
        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;

