import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import SessionFlow from './components/SessionFlow';
import SessionPlayer from './components/SessionPlayer';
import Auth from './components/Auth';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">ZenFlow AI is loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/session/new" element={user ? <SessionFlow /> : <Navigate to="/auth" />} />
          <Route path="/session/play" element={user ? <SessionPlayer /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  );
}
