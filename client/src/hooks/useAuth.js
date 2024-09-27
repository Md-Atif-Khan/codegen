import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
        } catch (error) {
            if (error.response?.data?.statusCode === 401) {
                setUser(null);
            } else {
                console.error("An unexpected error occurred", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = useCallback(async () => {
        try {
            const response = await api.post('/auth/logout');
            setUser(null);
            //   await new Promise(resolve => setTimeout(resolve, 2000));
            return response.data;
        } catch (error) {
            throw error;
        }
    }, []);


    const signup = async (username, password) => {
        try {
            const response = await api.post('/auth/signup', { username, password });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    return { user, loading, login, logout, signup, checkAuth };
};