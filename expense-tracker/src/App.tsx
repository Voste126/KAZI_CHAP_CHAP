import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// import myDashboard from './pages/Dashboard';
import AuthForm from './components/Auth/AuthForm';
import NotFound from './pages/NotFound';
import Dashboard from './components/BudgetManager';
import ExpensesList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Home from './pages/Home';
import VisualCharts from './components/visualCharts';

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
        {/* <Route path="/dashboard" element={Dashboard} /> */}
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/login" element={<AuthForm  />} />
        <Route path="/budget" element={<Dashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/visual" element={<VisualCharts />} />

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


