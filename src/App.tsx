// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Loading from './components/Loading';
import './App.css';

// Lazy Loading Strategy for performance optimization
const Login = React.lazy(() => import('./pages/Login'));
const PetList = React.lazy(() => import('./pages/PetList'));
const PetForm = React.lazy(() => import('./pages/PetForm'));
const PetDetail = React.lazy(() => import('./pages/PetDetail'));
const TutorForm = React.lazy(() => import('./pages/TutorForm'));

/**
 * Security Wrapper.
 * Validates session integrity before rendering protected routes.
 */
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      {/* Suspense handles the loading state for Lazy Loaded components */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/pets" element={<PrivateRoute><PetList /></PrivateRoute>} />
            <Route path="/pets/novo" element={<PrivateRoute><PetForm /></PrivateRoute>} />
            <Route path="/pets/:id" element={<PrivateRoute><PetDetail /></PrivateRoute>} />
            <Route path="/pets/editar/:id" element={<PrivateRoute><PetForm /></PrivateRoute>} />
            <Route path="/tutores" element={<PrivateRoute><TutorForm /></PrivateRoute>} />
            <Route path="/tutores/:id" element={<PrivateRoute><TutorForm /></PrivateRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;