import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Reviews from './pages/Reviews';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRequests from './pages/admin/AdminRequests';
import AdminBookings from './pages/admin/AdminBookings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerRequest from './pages/customer/CustomerRequest';
import CustomerRequests from './pages/customer/CustomerRequests';
import CustomerBookings from './pages/customer/CustomerBookings';
import BookingDetails from './pages/customer/BookingDetails';
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import MechanicRequests from './pages/mechanic/MechanicRequests';
import MechanicJobs from './pages/mechanic/MechanicJobs';
import MechanicBookings from './pages/mechanic/MechanicBookings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/reviews" element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/requests" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRequests />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBookings />
                </ProtectedRoute>
              } />

              <Route path="/customer/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer/request" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerRequest />
                </ProtectedRoute>
              } />
              <Route path="/customer/requests" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerRequests />
                </ProtectedRoute>
              } />
              <Route path="/customer/bookings" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerBookings />
                </ProtectedRoute>
              } />
              <Route path="/customer/bookings/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BookingDetails />
                </ProtectedRoute>
              } />

              <Route path="/mechanic/dashboard" element={
                <ProtectedRoute allowedRoles={['mechanic']}>
                  <MechanicDashboard />
                </ProtectedRoute>
              } />
              <Route path="/mechanic/requests" element={
                <ProtectedRoute allowedRoles={['mechanic']}>
                  <MechanicRequests />
                </ProtectedRoute>
              } />
              <Route path="/mechanic/my-jobs" element={
                <ProtectedRoute allowedRoles={['mechanic']}>
                  <MechanicJobs />
                </ProtectedRoute>
              } />
              <Route path="/mechanic/bookings" element={
                <ProtectedRoute allowedRoles={['mechanic']}>
                  <MechanicBookings />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
