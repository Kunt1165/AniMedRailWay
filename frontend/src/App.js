import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PetsPage from './pages/PetsPage';
import PetDetail from './pages/PetDetail';
import CalendarPage from './pages/CalendarPage';
import RemindersPage from './pages/RemindersPage';
import DiaryPage from './pages/DiaryPage';
import { ArticlesPage, NearbyPage } from './pages/OtherPages';
import './index.css';

function PrivateLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      {children}
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '12px',
              fontSize: '14px',
            }
          }}
        />
        <Routes>
          <Route path="/login" element={
            <PublicRoute><AuthPage /></PublicRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateLayout><Dashboard /></PrivateLayout>
          } />
          <Route path="/pets" element={
            <PrivateLayout><PetsPage /></PrivateLayout>
          } />
          <Route path="/pets/:id" element={
            <PrivateLayout><PetDetail /></PrivateLayout>
          } />
          <Route path="/calendar" element={
            <PrivateLayout><CalendarPage /></PrivateLayout>
          } />
          <Route path="/reminders" element={
            <PrivateLayout><RemindersPage /></PrivateLayout>
          } />
          <Route path="/diary" element={
            <PrivateLayout><DiaryPage /></PrivateLayout>
          } />
          <Route path="/articles" element={
            <PrivateLayout><ArticlesPage /></PrivateLayout>
          } />
          <Route path="/nearby" element={
            <PrivateLayout><NearbyPage /></PrivateLayout>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
