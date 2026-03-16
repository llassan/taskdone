import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LanguageRouter from './components/LanguageRouter';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import OrderDetail from './pages/OrderDetail';
import Vault from './pages/Vault';
import Plans from './pages/Plans';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerOrderDetail from './pages/WorkerOrderDetail';
import Earnings from './pages/Earnings';
import ContactWidget from './components/ContactWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Redirect root to /en */}
            <Route path="/" element={<Navigate to="/en" replace />} />

            {/* Language-prefixed routes */}
            <Route path="/:lang" element={<LanguageRouter />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Client */}
              <Route path="onboarding" element={<ProtectedRoute allowedRoles={['client']}><Onboarding /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['client']}><Dashboard /></ProtectedRoute>} />
              <Route path="order/:id" element={<ProtectedRoute allowedRoles={['client', 'admin']}><OrderDetail /></ProtectedRoute>} />
              <Route path="vault" element={<ProtectedRoute allowedRoles={['client']}><Vault /></ProtectedRoute>} />
              <Route path="plans" element={<ProtectedRoute allowedRoles={['client']}><Plans /></ProtectedRoute>} />

              {/* Worker */}
              <Route path="worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
              <Route path="worker/order/:id" element={<ProtectedRoute allowedRoles={['worker']}><WorkerOrderDetail /></ProtectedRoute>} />
              <Route path="worker/earnings" element={<ProtectedRoute allowedRoles={['worker']}><Earnings /></ProtectedRoute>} />
            </Route>

            {/* Catch old routes without lang prefix → redirect to /en/... */}
            <Route path="/login" element={<Navigate to="/en/login" replace />} />
            <Route path="/register" element={<Navigate to="/en/register" replace />} />
            <Route path="/dashboard" element={<Navigate to="/en/dashboard" replace />} />
            <Route path="/onboarding" element={<Navigate to="/en/onboarding" replace />} />
            <Route path="/vault" element={<Navigate to="/en/vault" replace />} />
            <Route path="/plans" element={<Navigate to="/en/plans" replace />} />
            <Route path="/worker" element={<Navigate to="/en/worker" replace />} />
            <Route path="/worker/earnings" element={<Navigate to="/en/worker/earnings" replace />} />
          </Routes>
          <ContactWidget />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
