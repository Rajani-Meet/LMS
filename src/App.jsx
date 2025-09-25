import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import { useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Lectures from './pages/Lectures';
import LectureView from './pages/LectureView';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import UserManagement from './pages/UserManagement';
import Analytics from './pages/Analytics';
import ContentModeration from './pages/ContentModeration';
import SetPassword from './pages/SetPassword';
import Profile from './pages/Profile';
import AuditLogs from './pages/AuditLogs';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/set-password" 
          element={
            <PublicRoute>
              <SetPassword />
            </PublicRoute>
          } 
        />

        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId/lectures" 
            element={
              <ProtectedRoute>
                <Lectures />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId/assignments" 
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId/quizzes" 
            element={
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lectures/:lectureId" 
            element={
              <ProtectedRoute>
                <LectureView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/moderation" 
            element={
              <ProtectedRoute>
                <ContentModeration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audit" 
            element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;