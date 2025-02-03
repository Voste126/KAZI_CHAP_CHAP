import React, { createContext, ReactNode, FC, useState } from 'react';

interface AuthContextProps {
    token: string | null;
    user: any; // Replace 'any' with your user type
    login: (token: string, user: any) => void; // Replace 'any' with your user type
    register: (token: string, user: any) => void; // Replace 'any' with your user type
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null); // Replace 'any' with your user type

    const login = (token: string, user: any) => { // Replace 'any' with your user type
        setToken(token);
        setUser(user);
    };

    const register = (token: string, user: any) => { // Replace 'any' with your user type
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };