import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  HeartHandshake,
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
  User,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor'); // 'donor' | 'ngo' (Admin cannot be publicly self-registered)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organizationName: '',
    organizationType: 'Hotel',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560001',
    // NGO verification fields
    registrationNumber: '',
    darpanId: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData((prev) => ({
      ...prev,
      organizationType: newRole === 'donor' ? 'Hotel' : 'NGO',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      setError('Please fill in all mandatory fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const res = await register({
        ...formData,
        role,
      });

      showToast(`Welcome to FoodBridge, ${res.user.name}!`, 'success');

      if (role === 'donor') navigate('/donor/dashboard', { replace: true });
      else if (role === 'ngo') navigate('/ngo/dashboard', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-warmth-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create your FoodBridge Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the zero-waste surplus food distribution network
          </p>
        </div>

        {/* Role Selection Tabs (Only Donor & NGO allowed for public signups) */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/70 rounded-2xl">
          <button
            type="button"
            onClick={() => handleRoleChange('donor')}
            className={`py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              role === 'donor'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-brand-600" />
            <span>Food Donor</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('ngo')}
            className={`py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              role === 'ngo'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-warmth-600" />
            <span>NGO / Charity / Shelter</span>
          </button>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Contact Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Vikram Anand"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. contact@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (min 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization / Kitchen Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder={role === 'donor' ? 'e.g. Grand Royal Hotel' : 'e.g. Hope Orphanage Trust'}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization Type *
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium bg-white"
                >
                  {role === 'donor' ? (
                    <>
                      <option value="Hotel">Hotel</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Hostel">Hostel</option>
                      <option value="Function Hall">Function Hall / Banquet</option>
                      <option value="Catering Service">Catering Service</option>
                      <option value="Corporate Cafeteria">Corporate Cafeteria</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Individual">Individual Donor</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="NGO">NGO (General Food Relief)</option>
                      <option value="Orphanage">Orphanage</option>
                      <option value="Old-Age Home">Old-Age Home</option>
                      <option value="Community Shelter">Community Shelter</option>
                      <option value="Charitable Trust">Charitable Trust</option>
                      <option value="Other">Other Charity</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru, Hyderabad"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street Address / Venue Location *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Complete pickup or distribution center address..."
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium resize-none"
                required
              />
            </div>

            {/* NGO Verification Details Section */}
            {role === 'ngo' && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                    NGO Verification Details
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  To maintain food safety and child welfare compliance, charitable organizations submit registration identifiers for administrative verification.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registration Certificate / Trust No.
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g. KA/TRUST/2021/4910"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NITI Aayog DARPAN ID
                    </label>
                    <input
                      type="text"
                      name="darpanId"
                      value={formData.darpanId}
                      onChange={handleChange}
                      placeholder="e.g. KA/2021/041120"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition flex items-center justify-center gap-2 group mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have a FoodBridge account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
