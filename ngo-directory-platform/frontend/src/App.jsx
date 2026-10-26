import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NGOProfile from './pages/NGOProfile';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import Donate from './pages/Donate';
import Event from './pages/Event';
import Contact from './pages/Contact';

// Emergency Medical Assistance & Direct Donations Pages
import EmergencyAssistance from './pages/EmergencyAssistance';
import MedicalAssistanceProfile from './pages/MedicalAssistanceProfile';
import CreateMedicalAssistance from './pages/CreateMedicalAssistance';
import PatientDashboard from './pages/PatientDashboard';
import DonorDashboard from './pages/DonorDashboard';
import DonationHistory from './pages/DonationHistory';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Existing Directory & Community Features */}
              <Route path="/" element={<Home />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/events" element={<Event />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ngos/:id" element={<NGOProfile />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                    <NGODashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Emergency Medical Assistance & Direct Donations Routes */}
              <Route path="/medical-assistance" element={<EmergencyAssistance />} />
              <Route path="/medical-assistance/new" element={<CreateMedicalAssistance />} />
              <Route path="/medical-assistance/:id" element={<MedicalAssistanceProfile />} />
              <Route
                path="/patient-dashboard"
                element={
                  <ProtectedRoute>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor-dashboard"
                element={
                  <ProtectedRoute>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donations/history"
                element={
                  <ProtectedRoute>
                    <DonationHistory />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20">
                    <div className="text-6xl">🏛️</div>
                    <h1 className="text-2xl font-bold text-gray-700">Page Not Found</h1>
                    <p className="text-sm text-gray-500">The requested welfare directory page does not exist.</p>
                    <a href="/" className="btn-primary btn-sm">Go to Directory Home</a>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e3a5f',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
