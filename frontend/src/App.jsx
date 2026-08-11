import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PosPage from './pages/PosPage';
import KitchenPage from './pages/KitchenPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ReportsPage from './pages/ReportsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import ExpensePage from './pages/ExpensePage';
import TableManagementPage from './pages/TableManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<AppLayout />}>
                {/* Admin Routes */}
                <Route index element={<Navigate to="/pos" replace />} />
                <Route path="dashboard" element={
                  <ProtectedRoute roles={['admin']}>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="reports" element={
                  <ProtectedRoute roles={['admin']}>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="menu" element={
                  <ProtectedRoute roles={['admin']}>
                    <MenuManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="expenses" element={
                  <ProtectedRoute roles={['admin']}>
                    <ExpensePage />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute roles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute roles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                } />

                {/* Cashier & Admin Routes */}
                <Route path="pos" element={
                  <ProtectedRoute roles={['admin', 'cashier']}>
                    <PosPage />
                  </ProtectedRoute>
                } />
                <Route path="orders" element={
                  <ProtectedRoute roles={['admin', 'cashier']}>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="tables" element={
                  <ProtectedRoute roles={['admin', 'cashier']}>
                    <TableManagementPage />
                  </ProtectedRoute>
                } />

                {/* Kitchen & All Roles */}
                <Route path="kitchen" element={
                  <ProtectedRoute roles={['admin', 'cashier', 'kitchen']}>
                    <KitchenPage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
