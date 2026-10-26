import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-white font-semibold' : 'text-blue-100 hover:text-white'
    }`;

  return (
    <header className="bg-navy shadow-glass sticky top-0 z-50">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-sm leading-tight block">NGO Directory</span>
              <span className="text-blue-200 text-xs leading-tight block">& Emergency Medical Aid</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-5">
            <NavLink to="/" className={linkClass} end>Directory</NavLink>

            {/* Prominent Emergency Medical Assistance Nav Link */}
            <NavLink
              to="/medical-assistance"
              className={({ isActive }) =>
                `text-sm font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-red-200 hover:text-white hover:bg-white/10'
                }`
              }>
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
              <span>Medical Aid 🩺</span>
            </NavLink>

            <NavLink to="/donate" className={linkClass}>NGO Donations</NavLink>
            <NavLink to="/events" className={linkClass}>Drives</NavLink>
            <NavLink to="/contact" className={linkClass}>Helpdesk</NavLink>

            {user && (
              <>
                <NavLink to="/patient-dashboard" className={linkClass}>Patient Desk</NavLink>
                <NavLink to="/donor-dashboard" className={linkClass}>My Donations</NavLink>
              </>
            )}

            {user?.role === 'ngo' && (
              <NavLink to="/dashboard" className={linkClass}>My NGO</NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={linkClass}>Admin Panel</NavLink>
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white text-xs font-semibold leading-tight">{user.name}</p>
                  <p className="text-blue-200 text-[10px] capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary btn-sm text-xs px-3 py-1.5">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-blue-100 hover:text-white text-xs font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary btn-sm text-xs">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-navy-light transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-navy-light py-4 space-y-2 animate-fade-in text-sm">
            <NavLink to="/" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)} end>
              Directory
            </NavLink>
            <NavLink to="/medical-assistance" className="block text-red-200 hover:text-white py-1.5 font-bold" onClick={() => setMenuOpen(false)}>
              🚨 Emergency Medical Assistance
            </NavLink>
            <NavLink to="/donate" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)}>
              NGO Donations
            </NavLink>
            <NavLink to="/events" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)}>
              Events & Drives
            </NavLink>
            <NavLink to="/contact" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)}>
              Helpdesk & Grievance
            </NavLink>

            {user && (
              <>
                <NavLink to="/patient-dashboard" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)}>
                  Patient Dashboard
                </NavLink>
                <NavLink to="/donor-dashboard" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)}>
                  My Donation Receipts
                </NavLink>
              </>
            )}

            {user?.role === 'ngo' && (
              <NavLink to="/dashboard" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)}>
                My NGO Dashboard
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="block text-blue-100 hover:text-white py-1.5 font-medium" onClick={() => setMenuOpen(false)}>
                Admin Panel
              </NavLink>
            )}

            {user ? (
              <button onClick={handleLogout} className="w-full text-left text-red-300 hover:text-red-200 py-2 font-medium text-xs">
                Logout ({user.name})
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="btn-secondary btn-sm flex-1 justify-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-primary btn-sm flex-1 justify-center" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
