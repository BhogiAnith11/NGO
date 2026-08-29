import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-dark text-white mt-auto border-t border-navy-light">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-sm">
                🏛️
              </div>
              <h3 className="font-bold text-base text-white">NGO Directory</h3>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed mb-4">
              District-Level Government Digital Initiative connecting citizens, donors, and non-profits for structured welfare coordination.
            </p>
            <div className="text-[11px] text-blue-300">
              Department of Social Welfare & Empowerment
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-blue-100">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-xs text-blue-200">
              <li><Link to="/" className="hover:text-white transition-colors">NGO Directory & Search</Link></li>
              <li><Link to="/donate" className="hover:text-white transition-colors">Donate & Material Aid</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Charity Drives & Events</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Helpdesk & Grievance</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-blue-100">
              Stakeholder Portals
            </h4>
            <ul className="space-y-2 text-xs text-blue-200">
              <li><Link to="/register" className="hover:text-white transition-colors">NGO Registration</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Volunteer / Donor Signup</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Member Sign In</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">District Nodal Login</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-blue-100">
              Nodal Contact
            </h4>
            <div className="space-y-1.5 text-xs text-blue-200">
              <div>📍 District Collectorate Complex</div>
              <div>📞 Helpline: +91 (0253) 2578900</div>
              <div>✉️ Email: welfare.district@gov.in</div>
              <div className="text-[11px] text-emerald-light pt-1 font-semibold">● Portal Status: Operational</div>
            </div>
          </div>
        </div>

        <div className="divider border-navy-light mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-300">
          <p>© {year} NGO Directory & Social Impact Platform. District Government Initiative.</p>
          <p className="text-[11px] text-blue-400">All rights reserved · Digital Public Infrastructure</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
