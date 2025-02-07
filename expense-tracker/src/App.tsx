import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import AuthForm from './components/Auth/AuthForm';
import NotFound from './pages/NotFound';
import BudgetManager from './components/BudgetManager';
import ExpensesList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';

const App: React.FC = () => {
    const [token] = useState<string | null>(localStorage.getItem('jwtToken'));

    // const handleLogin = (jwt: string) => {
    //     localStorage.setItem('jwtToken', jwt);
    //     setToken(jwt);
    // };

    // const handleLogout = () => {
    //     localStorage.removeItem('jwtToken');
    //     setToken(null);
    // };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/login" element={<AuthForm  />} />
        <Route path="/budget" element={<BudgetManager />} />

        {/* Protected Routes */}
        {token ? (
          <>
            <Route path="/expenses" element={<ExpensesList token={token} />} />
            <Route path="/expense/new" element={<ExpenseForm token={token} />} />
            <Route path="/expense/edit/:id" element={<ExpenseForm token={token} />} />
            {/* If token exists, any unknown route redirects to /expenses */}
            <Route path="*" element={<Navigate to="/expenses" replace />} />
          </>
        ) : (
          // If not authenticated, any unknown route redirects to /login
          <Route path="*" element={<Navigate to="/login" replace />} />
          
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;


