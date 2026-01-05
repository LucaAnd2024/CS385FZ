import React, { createContext, useState, useContext, ReactNode } from 'react';
import { authApi } from '../services/api';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    signIn: (credentials: any) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const signIn = async (credentials: any) => {
        setLoading(true);
        try {
            console.log('Attempting login with:', credentials);
            const response = await authApi.login(credentials);
            console.log('Login response:', response);

            if (response.code === 0 && response.data) {
                setUser(response.data);
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
