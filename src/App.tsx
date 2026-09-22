import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { RequireAdmin, RequireAuth } from './components/RequireAuth';
import { EventsListPage } from './pages/events/EventsListPage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { OrderDetailPage } from './pages/orders/OrderDetailPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { VenuesPage } from './pages/admin/VenuesPage';
import { VenueDetailPage } from './pages/admin/VenueDetailPage';
import { EventsAdminPage } from './pages/admin/EventsAdminPage';
import { RefundsPage } from './pages/admin/RefundsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { TicketsCheckPage } from './pages/admin/TicketsCheckPage';
import { SupportChatPage } from './pages/admin/SupportChatPage';
import { ChatPage } from './pages/chat/ChatPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route path="/events" element={<EventsListPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />


              <Route element={<RequireAuth />}>
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/chat" element={<ChatPage />} />

              </Route>

              <Route path="/admin" element={<RequireAdmin />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<VenuesPage />} />
                  <Route path="venues/:id" element={<VenueDetailPage />} />
                  <Route path="events" element={<EventsAdminPage />} />
                  <Route path="refunds" element={<RefundsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="tickets-check" element={<TicketsCheckPage />} />
                  <Route path="chat" element={<SupportChatPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/events" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
