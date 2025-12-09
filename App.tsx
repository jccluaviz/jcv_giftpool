import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MyGifts } from './pages/MyGifts';
import { Contributions } from './pages/Contributions';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const AuthRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : <Auth />;
}

const AppRoutes = () => {
  return (
    <Routes>
       <Route path="/auth" element={<AuthRoute />} />
       <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
       <Route path="/my-gifts" element={<PrivateRoute><Layout><MyGifts /></Layout></PrivateRoute>} />
       <Route path="/contributions" element={<PrivateRoute><Layout><Contributions /></Layout></PrivateRoute>} />
       <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
       <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}