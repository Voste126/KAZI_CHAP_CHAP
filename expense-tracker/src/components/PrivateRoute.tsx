import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const PrivateRoute: React.FC = () => {
    const token  = localStorage.getItem('jwtToken');

    if (!token) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;