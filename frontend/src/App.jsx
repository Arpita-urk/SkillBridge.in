import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Discover from './pages/Discover.jsx';
import MySkills from './pages/MySkills.jsx';
import Requests from './pages/Requests.jsx';
import Notifications from './pages/Notifications.jsx';
import Chat from './pages/Chat.jsx';
import Admin from './pages/Admin.jsx';
import Profile from './pages/Profile.jsx';
function Guard({ guest }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-soft">Loading…</div>;
  if (guest) return user ? <Navigate to="/app" replace /> : <Outlet />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Guard guest />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>
      <Route element={<Guard />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Discover />} />
          <Route path="my-skills" element={<MySkills />} />
          <Route path="requests" element={<Requests />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="chat/:id" element={<Chat />} />
          <Route path="admin" element={<Admin />} />
          <Route path="profile" element={<Profile />} />
          <Route path="u/:id" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
