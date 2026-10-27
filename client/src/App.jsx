import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
