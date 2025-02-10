// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthForm from './components/Auth/AuthForm';
import NotFound from './pages/NotFound';
import Dashboard from './components/BudgetManager';
import ExpensesList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Home from './pages/Home';
import VisualCharts from './components/visualCharts';
import About from './pages/About';
import Logout from './components/Auth/Logout';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));

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
            <Route path="/logout" element={<Logout setToken={setToken} />} />
            <Route path="*" element={<Navigate to="/expenses" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
        
        {/* Fallback route if no other route matches */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;





