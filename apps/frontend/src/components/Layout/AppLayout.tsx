import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setSocket, setConnected, setConnectionError } from '../../store/slices/socketSlice';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { authService } from '../../utils/auth';
import type { AppDispatch } from '../../store/store';

// Import pages
import LandingPage from '../../pages/LandingPage';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import ForgotPasswordPage from '../../pages/ForgotPasswordPage';
import DashboardPage from '../../pages/DashboardPage';
import NotFoundPage from '../../pages/NotFoundPage';
import ProtectedRoute from '../ProtectedRoute';

const AppLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    // Initialize auth state if user has a token
    if (authService.isAuthenticated()) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);
  
  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');
    
    dispatch(setSocket(socketInstance));
    
    socketInstance.on('connect', () => {
      console.log('✅ Connected to High Seas VTT server');
      dispatch(setConnected(true));
    });
    
    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      dispatch(setConnected(false));
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      dispatch(setConnectionError(error.message));
    });
    
    // Test connection
    socketInstance.on('test-response', (data) => {
      console.log('Test response:', data);
    });
    
    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppLayout;
