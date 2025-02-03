import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './pages/NotFound';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute >
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App
