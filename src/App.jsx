import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './dashboards/AdminDashboard';
import FleetManagerDashboard from './dashboards/FleetManagerDashboard';
import FleetInventory from './pages/FleetInventory';
import DriverDashboard from './dashboards/DriverDashboard';
import CustomerDashboard from './dashboards/CustomerDashboard';
import UserProfile from './pages/UserProfile';
import TripHistoryPage from './pages/TripHistoryPage';
import UpcomingTripsPage from './pages/UpcomingTripsPage';
import ExpensesPage from './pages/ExpensesPage';
import FavoriteRoutesPage from './pages/FavoriteRoutesPage';
import DriverEarningsPage from './pages/driver/DriverEarningsPage';
import DriverPerformancePage from './pages/driver/DriverPerformancePage';
import DriverTripsPage from './pages/driver/DriverTripsPage';
import BookingPage from './pages/BookingPage';
import LiveTrackingPage from './pages/module3/LiveTrackingPage';
import RouteOptimizationDashboard from './pages/module3/RouteOptimizationDashboard';
import MaintenancePage from './pages/MaintenancePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import TrafficFooter from './components/TrafficFooter';
import LoadingScreen from './components/LoadingScreen';
import './index.css'; // Global styles
import './styles/animations.css'; // Animation styles

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/revenue" element={<AdminRevenuePage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN', 'CUSTOMER']} />}>
          <Route path="/manager-dashboard" element={<FleetManagerDashboard />} />
          <Route path="/fleet" element={<FleetInventory />} />
          <Route path="/route-opt" element={<RouteOptimizationDashboard />} />
          <Route path="/tracking" element={<LiveTrackingPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']} />}>
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/driver/trips" element={<DriverTripsPage />} />
          <Route path="/driver/earnings" element={<DriverEarningsPage />} />
          <Route path="/driver/performance" element={<DriverPerformancePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/history" element={<TripHistoryPage />} />
          <Route path="/upcoming" element={<UpcomingTripsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/favorites" element={<FavoriteRoutesPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DRIVER', 'FLEET_MANAGER', 'CUSTOMER']} />}>
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <TrafficFooter />
    </Router>
  );
}

export default App;
