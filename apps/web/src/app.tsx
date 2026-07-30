
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route';
import { GuestRoute } from './components/guest-route';
import { LoginPage } from './pages/auth/login.page';
import { RegisterPage } from './pages/auth/register.page';
import { ForgotPasswordPage } from './pages/auth/forgot-password.page';
import { ChatPage } from './pages/chat/chat.page';

export function App() {
  return (
    <Routes>
      {/* Guest Routes (Only accessible when unauthenticated) */}
      <Route element={<GuestRoute redirectTo="/chat" />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Routes (Only accessible when authenticated) */}
      <Route element={<ProtectedRoute redirectTo="/login" />}>
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
