import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import MarketsPage from './pages/MarketsPage';
import LearningPage from './pages/LearningPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DisclaimerPage from './pages/DisclaimerPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TerminalPage from './pages/TerminalPage';

export default function App() {
  return (
    <Routes>
      {/* Public Website Routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/features"
        element={
          <PublicLayout>
            <FeaturesPage />
          </PublicLayout>
        }
      />
      <Route
        path="/markets"
        element={
          <PublicLayout>
            <MarketsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/learning"
        element={
          <PublicLayout>
            <LearningPage />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <ContactPage />
          </PublicLayout>
        }
      />
      <Route
        path="/disclaimer"
        element={
          <PublicLayout>
            <DisclaimerPage />
          </PublicLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          <PublicLayout>
            <PrivacyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <PublicLayout>
            <TermsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />

      {/* Authenticated Trading Terminal Route */}
      <Route path="/app" element={<TerminalPage />} />

      {/* Catch-all redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
