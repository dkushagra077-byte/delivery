import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader } from './components/common/Loader';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage, RegisterPage, DashboardPage } from './pages';

const Guard = ({ children }) => {
  const { loading, user } = useAuth();
  if (loading) return <Loader fullScreen message="Restoring your secure session..." />;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<Guard><AppLayout /></Guard>}><Route index element={<DashboardPage />} /></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
