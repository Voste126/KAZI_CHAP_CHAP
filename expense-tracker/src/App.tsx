import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';;

import Dashboard from './pages/Dashboard';
import AuthForm from './components/Auth/AuthForm'
import NotFound from './pages/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/auth" element={<AuthForm />} />
            </Routes>
        </Router>
    );
}

export default App
