import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import DiscoverShell from '@/components/discover/DiscoverShell';
import HostShell from '@/components/host/HostShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import Nearby from '@/pages/Nearby';
import Calculator from '@/pages/Calculator';
import PropertyDetail from '@/pages/PropertyDetail';
import Compare from '@/pages/Compare';
import Roommates from '@/pages/Roommates';
import MyActivity from '@/pages/MyActivity';
import OwnerDashboard from '@/pages/OwnerDashboard';
import ListingWizard from '@/pages/ListingWizard';
import OwnerVerificationPage from '@/pages/OwnerVerificationPage';
import Admin from '@/pages/Admin';
import Account from '@/pages/Account';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Mfa from '@/pages/Mfa';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* HOMORA Discover — the customer-facing app */}
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

      {/* HOMORA Host — the owner console, a separate app on the same backend */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?returnTo=/host" replace />} />}>
        <Route path="/host" element={<HostShell />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="listings/new" element={<ListingWizard />} />
          <Route path="listings/:id/edit" element={<ListingWizard />} />
          <Route path="verification" element={<OwnerVerificationPage />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />

      {/* Earlier owner paths keep working */}
      <Route path="/owner/listings/new" element={<Navigate to="/host/listings/new" replace />} />
      <Route path="/owner/verification" element={<Navigate to="/host/verification" replace />} />
      <Route path="/owner/*" element={<Navigate to="/host" replace />} />
      <Route path="/admin" element={<Navigate to="/host/admin" replace />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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