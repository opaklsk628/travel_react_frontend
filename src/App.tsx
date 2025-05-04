import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage          from './pages/HomePage';
import HotelListPage     from './pages/HotelListPage';
import HotelDetailPage   from './pages/HotelDetailPage';
import RegisterPage      from './pages/RegisterPage';
import LoginPage         from './pages/LoginPage';
import FavoritesPage     from './pages/FavoritesPage';
import AdminDashboard    from './pages/AdminDashboard';
import AmadeusHotelsPage from './pages/AmadeusHotelsPage';
import Header            from './components/layout/Header';

// permissions
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />

        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/hotels"      element={<HotelListPage />} />
          <Route path="/hotels/:id"  element={<HotelDetailPage />} />

          {/* Amadeus API hotel list*/}
          <Route path="/hotels/external" element={<AmadeusHotelsPage />} />

          <Route path="/register"   element={<RegisterPage />} />
          <Route path="/login"      element={<LoginPage />} />

          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <FavoritesPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
