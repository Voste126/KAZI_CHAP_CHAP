import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';;

import Dashboard from './pages/Dashboard';
import AuthForm from './components/Auth/AuthForm'
import NotFound from './pages/NotFound';
import BudgetManager from './components/BudgetManager';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/budget" element={<BudgetManager />} />
            </Routes>
        </Router>
    );
}

export default App
