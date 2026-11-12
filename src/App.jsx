import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import DiscoverShell from '@/components/discover/DiscoverShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import SharedRealtimeSync from '@/components/SharedRealtimeSync';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import Nearby from '@/pages/Nearby';
import Calculator from '@/pages/Calculator';
import PropertyDetail from '@/pages/PropertyDetail';
import Compare from '@/pages/Compare';
import Roommates from '@/pages/Roommates';
import MyActivity from '@/pages/MyActivity';
import Account from '@/pages/Account';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Mfa from '@/pages/Mfa';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
      <SharedRealtimeSync />
      <Routes>
        <Route element={<DiscoverShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/nearby" element={<Nearby />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/dashboard" element={<MyActivity />} />
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route path="/account" element={<Account />} />
            <Route path="/roommates" element={<Roommates />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/mfa" element={<Mfa />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
