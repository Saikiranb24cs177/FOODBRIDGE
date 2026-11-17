import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Heart,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';

const Footer = () => {
  const [modalType, setModalType] = useState(null); // 'privacy' | 'terms' | null

  return (
    <>
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Brand Info */}
            <div className="lg:col-span-2 space-y-4" id="about">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-warmth-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-white">
                  Food<span className="text-brand-400">Bridge</span>
                </span>
              </Link>

              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                <span className="text-white font-semibold italic">“Turning Surplus Food Into Hope.”</span>{' '}
                FoodBridge is an AI-powered smart donation platform connecting hotels, restaurants, hostels, and banquet venues with verified NGOs, orphanages, and community shelters.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Certified Safe Food Distribution Protocol
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/donations" className="hover:text-white transition">
                    Food Listings
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/donate" className="hover:text-white transition">
                    Donate Surplus Food
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition">
                    Join Network (Register)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Dashboards
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/donor/dashboard" className="hover:text-white transition">
                    Donor Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/ngo/dashboard" className="hover:text-white transition">
                    NGO Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="hover:text-white transition">
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="hover:text-white transition">
                    Reset Password
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Contact & Support
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                  <span>+91 98765 43210 (Support Hotline)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                  <span>contact@foodbridge.org</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                  <span>Bengaluru • Hyderabad • Mumbai</span>
                </li>
              </ul>

              <div className="pt-4 flex items-center gap-3">
                <a
                  href="#social"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 transition flex items-center justify-center text-xs font-bold text-white"
                  title="Twitter"
                >
                  X
                </a>
                <a
                  href="#social"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 transition flex items-center justify-center text-xs font-bold text-white"
                  title="LinkedIn"
                >
                  in
                </a>
                <a
                  href="#social"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 transition flex items-center justify-center text-xs font-bold text-white"
                  title="Instagram"
                >
                  ig
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} FoodBridge Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setModalType('privacy')}
                className="hover:text-slate-300 underline transition"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setModalType('terms')}
                className="hover:text-slate-300 underline transition"
              >
                Terms and Conditions
              </button>
              <span className="hidden md:flex items-center gap-1 text-slate-400">
                Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Zero Hunger
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {modalType === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-brand-600">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-extrabold text-xl">Privacy Policy</h3>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                At FoodBridge, we are deeply committed to protecting the privacy and sensitive operational details of our food donors, partner charitable trusts, and community volunteers.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">1. Information We Collect</h4>
              <p>
                We collect contact names, verified organization affiliations, pickup addresses, phone coordinates, and food safety certifications solely for coordinating food rescue pickups.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">2. Security & Token Protection</h4>
              <p>
                Passwords are never stored in plaintext and are securely hashed using bcrypt. Access tokens use industry-standard JSON Web Tokens (JWT).
              </p>
              <h4 className="font-bold text-slate-900 text-sm">3. Zero Data Commercialization</h4>
              <p>
                FoodBridge is a non-profit social initiative. We never sell or rent user details to commercial third parties.
              </p>
            </div>
            <button
              onClick={() => setModalType(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition"
            >
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {modalType === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-brand-600">
              <FileText className="w-6 h-6" />
              <h3 className="font-extrabold text-xl">Terms and Conditions</h3>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Welcome to FoodBridge. By using this platform to donate or claim surplus food, you agree to these operational standards.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">1. Mandatory Food Safety Declaration</h4>
              <p>
                All donors must certify that surplus meals were cooked in hygienic conditions, stored at safe temperatures, and listed with accurate consumption deadlines.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">2. Volunteer Verification</h4>
              <p>
                NGO pickup volunteers must provide legitimate identification, vehicle numbers, and verify handoff using the 4-digit verification OTP.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">3. Charitable Use Only</h4>
              <p>
                Claimed food must be distributed free of charge to hungry individuals, shelter residents, and orphanages. Resale of rescued food is strictly prohibited.
              </p>
            </div>
            <button
              onClick={() => setModalType(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition"
            >
              Accept & Close Terms
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
