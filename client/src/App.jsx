import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { InstituteProvider } from './context/InstituteContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import MarksEntry from './pages/MarksEntry';
import ResultAnalysis from './pages/ResultAnalysis';
import ResultHistory from './pages/ResultHistory';
import ResultView from './pages/ResultView';
import Analytics from './pages/Analytics';
import Subjects from './pages/Subjects';
import Settings from './pages/Settings';
import NeedingSupport from './pages/NeedingSupport';

const ProtectedLayout = ({ children, requiredRole }) => {
  const { isAuthenticated, initializing, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#00264D] border-t-[#FF7F00] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-600">Verifying AnkSetu session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Authentication Pages */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login initialMode="login" />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login initialMode="signup" />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login initialMode="forgot" />}
      />

      {/* Protected Dashboard & App Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedLayout>
            <Students />
          </ProtectedLayout>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedLayout>
            <StudentProfile />
          </ProtectedLayout>
        }
      />
      <Route
        path="/marks-entry"
        element={
          <ProtectedLayout>
            <MarksEntry />
          </ProtectedLayout>
        }
      />
      <Route
        path="/result-analysis"
        element={
          <ProtectedLayout>
            <ResultAnalysis />
          </ProtectedLayout>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedLayout>
            <ResultHistory />
          </ProtectedLayout>
        }
      />
      <Route path="/result" element={<Navigate to="/results" replace />} />
      <Route path="/result-history" element={<Navigate to="/results" replace />} />
      <Route path="/results-history" element={<Navigate to="/results" replace />} />
      <Route
        path="/results/:id"
        element={
          <ProtectedLayout>
            <ResultView />
          </ProtectedLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedLayout>
            <Analytics />
          </ProtectedLayout>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedLayout>
            <Subjects />
          </ProtectedLayout>
        }
      />
      <Route
        path="/needing-support"
        element={
          <ProtectedLayout>
            <NeedingSupport />
          </ProtectedLayout>
        }
      />
      <Route path="/support-overview" element={<Navigate to="/needing-support" replace />} />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InstituteProvider>
          <Router>
            <AppRoutes />
          </Router>
        </InstituteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
