import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  Building2,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Phone,
  Calendar,
  ExternalLink,
  Brain,
  Layers,
  Settings,
  User as UserIcon,
  LogOut,
  Sparkles,
  Check,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RequestModal from '../components/RequestModal';
import TrackingTimeline from '../components/TrackingTimeline';
import { donationService } from '../services/donationService';
import { requestService } from '../services/requestService';
import { aiService } from '../services/aiService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NgoDashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // Sidebar navigation sections:
  // 'overview' | 'available' | 'ai-recommendations' | 'requests' | 'accepted' | 'tracking' | 'profile' | 'settings'
  const [activeSection, setActiveSection] = useState('overview');

  const [availableDonations, setAvailableDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Recommendations state
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Search & filter for available food
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('');

  // Request Modal state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // OTP inputs map for verification
  const [otpInputs, setOtpInputs] = useState({});

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    organizationName: user?.organizationName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || 'Karnataka',
    pinCode: user?.pinCode || '560001',
    beneficiaryCapacity: user?.beneficiaryCapacity || 60,
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [availRes, myReqRes] = await Promise.all([
        donationService.getAllDonations({
          status: 'Available',
          search: search.trim() || undefined,
          category: category !== 'All' ? category : undefined,
          city: city.trim() || undefined,
        }),
        requestService.getMyRequests(),
      ]);

      setAvailableDonations(availRes.donations || []);
      setMyRequests(myReqRes.requests || []);
    } catch (err) {
      console.error(err);
      showToast('Could not load NGO portal data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, city, showToast]);

  const fetchAiRecommendations = useCallback(async () => {
    try {
      setIsLoadingAi(true);
      const res = await aiService.getRecommendations({ ngoId: user?._id });
      setAiRecommendations(res.data?.recommendations || []);
    } catch (err) {
      console.warn('AI recommendations fallback', err);
    } finally {
      setIsLoadingAi(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (activeSection === 'ai-recommendations') {
      fetchAiRecommendations();
    }
  }, [activeSection, fetchAiRecommendations]);

  // Lifecycle transitions: Picked Up (with OTP check) or Delivered
  const handleLifecycleUpdate = async (requestId, nextStatus) => {
    try {
      setActionInProgressId(requestId);
      const otp = otpInputs[requestId] || '';

      const res = await requestService.updateLifecycleStatus(
        requestId,
        nextStatus,
        nextStatus === 'Picked Up'
          ? 'Volunteer verified OTP and collected food from donor kitchen.'
          : 'Meals safely distributed to registered beneficiaries.',
        otp
      );

      showToast(res.message || `Status updated to ${nextStatus}!`, 'success');
      await fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Status update failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleOpenRequest = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await authService.updateProfile(profileForm);
      showToast('Organisation profile updated!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Update failed', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Metrics
  const pendingRequests = myRequests.filter((r) => r.status === 'Pending');
  const acceptedRequests = myRequests.filter((r) =>
    ['Accepted', 'Ready for Pickup'].includes(r.status)
  );
  const pickedUpRequests = myRequests.filter((r) => r.status === 'Picked Up');
  const deliveredRequests = myRequests.filter((r) =>
    ['Delivered', 'Completed'].includes(r.status)
  );

  const totalMealsClaimed = myRequests
    .filter((r) => ['Accepted', 'Ready for Pickup', 'Picked Up', 'Delivered', 'Completed'].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.requestedQuantity || r.servingsRequested) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-warmth-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warmth-500/20 text-warmth-300 text-xs font-bold border border-warmth-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {user?.verificationStatus === 'verified' ? 'Verified NGO Partner' : 'Verification Under Review'} • {user?.organizationType || 'Charity'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.organizationName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Claim fresh surplus food from premier hospitality kitchens and feed your community with dignity.
          </p>
        </div>

        <button
          onClick={() => setActiveSection('available')}
          className="px-6 py-3.5 rounded-2xl bg-warmth-500 hover:bg-warmth-600 text-slate-900 font-bold text-xs sm:text-sm shadow-lg shadow-warmth-500/20 flex items-center gap-2 transition flex-shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Browse Available Surplus</span>
        </button>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-4 space-y-2 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            NGO Portal
          </div>

          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeSection === 'overview'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveSection('available')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'available'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4" />
              <span>Available Food</span>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              {availableDonations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('ai-recommendations')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'ai-recommendations'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>AI Recommendations</span>
            </div>
            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">
              Smart
            </span>
          </button>

          <button
            onClick={() => setActiveSection('requests')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'requests'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>My Requests</span>
            </div>
            <span className="text-xs font-bold text-slate-500">{myRequests.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('accepted')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'accepted'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Accepted Donations</span>
            </div>
            {acceptedRequests.length > 0 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {acceptedRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('tracking')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeSection === 'tracking'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-warmth-600" />
            <span>Pickup Tracking</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Account
            </div>

            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeSection === 'profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Organisation Profile</span>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeSection === 'settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2.5 mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 space-y-6">
          {/* 1. OVERVIEW TAB */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Available Nearby
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-brand-600">
                    {availableDonations.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Live rescue listings</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Requests Submitted
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">
                    {myRequests.length}
                  </p>
                  <p className="text-[11px] text-slate-500">{pendingRequests.length} pending approval</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Accepted Donations
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                    {acceptedRequests.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Ready for pickup run</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Completed Pickups
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-teal-700">
                    {deliveredRequests.length}
                  </p>
                  <p className="text-[11px] text-slate-500">{totalMealsClaimed} meals served</p>
                </div>
              </div>

              {/* Ready for Pickup Alert */}
              {acceptedRequests.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        You have {acceptedRequests.length} accepted donations ready for collection!
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Dispatch volunteer with the 4-digit verification OTP to claim food batches.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('accepted')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    View OTPs
                  </button>
                </div>
              )}

              {/* Quick Available Feed Preview */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Fresh Food Listings Nearby</h3>
                    <p className="text-xs text-slate-500">Ready for claim by your organization</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('available')}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Browse All ({availableDonations.length})
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {availableDonations.slice(0, 3).map((d) => (
                    <div key={d._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={d.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                          alt={d.foodName}
                          className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{d.foodName}</h4>
                          <p className="text-xs text-slate-500">
                            {d.servings} Servings ({d.quantity} {d.quantityUnit || ''}) • {d.donor?.organizationName || 'Hotel Donor'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{d.pickupCity}</span>
                            <span>•</span>
                            <span>Expires: {new Date(d.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenRequest(d)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Claim Batch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. AVAILABLE FOOD TAB */}
          {activeSection === 'available' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search dishes or donor hotels..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="relative w-48">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Filter by city..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="All">All Categories</option>
                  <option value="Cooked meals">Cooked meals</option>
                  <option value="Rice and grains">Rice and grains</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Bakery items">Bakery items</option>
                  <option value="Packaged food">Packaged food</option>
                </select>
              </div>

              {/* Listings Feed */}
              {availableDonations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                  <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">No matching food batches available</p>
                  <p className="text-xs">Try clearing filters to view all active food rescues.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableDonations.map((d) => (
                    <div
                      key={d._id}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-40 overflow-hidden bg-slate-100">
                          <img
                            src={d.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                            alt={d.foodName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800">
                              {d.category}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <StatusBadge status={d.status} />
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{d.foodName}</h4>
                          <p className="text-xs text-brand-700 font-bold">
                            {d.servings} Servings ({d.quantity} {d.quantityUnit || ''}) • {d.dietaryType}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">{d.description}</p>

                          <div className="space-y-1 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 truncate">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{d.donor?.organizationName || 'Hotel Donor'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{d.pickupCity} ({d.pickupAddress})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>Pickup Window: {d.pickupStartTime || '12:00'} - {d.pickupEndTime || '18:00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          onClick={() => handleOpenRequest(d)}
                          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <HeartHandshake className="w-4 h-4" />
                          <span>Request Food</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. AI RECOMMENDATIONS TAB */}
          {activeSection === 'ai-recommendations' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-900 text-lg">AI Smart Recommendations</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Food batches ranked specifically for {user?.organizationName || 'your organization'} based on your beneficiary capacity ({user?.beneficiaryCapacity || 60} people) and proximity.
                  </p>
                </div>
                <button
                  onClick={fetchAiRecommendations}
                  className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold transition"
                >
                  Refresh AI Matches
                </button>
              </div>

              {isLoadingAi ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold">Analyzing local food surplus batches...</p>
                </div>
              ) : aiRecommendations.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Brain className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">No active AI matches found right now</p>
                  <p className="text-xs">Check back soon as banquet donors list new evening surplus batches.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiRecommendations.map((rec) => {
                    const d = rec.donation;
                    return (
                      <div
                        key={d._id}
                        className="p-5 rounded-2xl border-2 border-purple-100 bg-purple-50/20 hover:border-purple-300 transition space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={d.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                              alt={d.foodName}
                              className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                {d.foodName}
                              </h4>
                              <p className="text-xs text-slate-500">
                                {d.servings} Servings • {d.donor?.organizationName || 'Donor Kitchen'}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>{d.pickupCity}</span>
                                {rec.distanceKm !== null && <span>({rec.distanceKm} km away)</span>}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                              {rec.matchScore}% AI Score
                            </span>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="space-y-1 pt-1 border-t border-purple-100">
                          {rec.reasons?.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleOpenRequest(d)}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                          >
                            Claim this Recommendation
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. MY REQUESTS TAB */}
          {activeSection === 'requests' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">My Food Requests & Statuses</h3>
                <p className="text-xs text-slate-500">
                  Track the status of all food claims submitted by your shelter or organization.
                </p>
              </div>

              {myRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">No requests submitted yet</p>
                  <p className="text-xs">Browse available surplus food and submit a pickup claim.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((r) => (
                    <div
                      key={r._id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {r.donation?.foodName || 'Food Batch'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Donor: {r.donor?.organizationName || r.donor?.name} • Requested {r.requestedQuantity || r.servingsRequested} servings
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div>
                          <span className="font-bold text-slate-400 block text-[10px] uppercase">
                            Volunteer
                          </span>
                          <span>{r.volunteerName} ({r.volunteerPhone})</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 block text-[10px] uppercase">
                            Pickup Window
                          </span>
                          <span>{r.pickupTime || r.proposedPickupTime}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 block text-[10px] uppercase">
                            Vehicle
                          </span>
                          <span>{r.vehicleNumber || 'Standard Carrier'}</span>
                        </div>
                      </div>

                      {r.responseNote && (
                        <p className="text-xs text-slate-600 italic">
                          Donor note: "{r.responseNote}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. ACCEPTED DONATIONS & PICKUP WORKFLOW */}
          {activeSection === 'accepted' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Accepted Donations & OTP Verification</h3>
                <p className="text-xs text-slate-500">
                  Donor kitchens have approved these batches. Send volunteers with the verification OTP to collect food.
                </p>
              </div>

              {acceptedRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">No accepted donations pending pickup</p>
                  <p className="text-xs">Once a donor approves your request, the 4-digit OTP will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {acceptedRequests.map((r) => (
                    <div
                      key={r._id}
                      className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Approved For Pickup
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1">
                            {r.donation?.foodName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Donor: {r.donor?.organizationName || r.donor?.name} ({r.donor?.phone})
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>

                      {/* 4-Digit OTP Box */}
                      <div className="p-4 rounded-xl bg-white border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                            4-Digit Pickup Verification OTP
                          </span>
                          <span className="text-2xl font-black text-emerald-800 tracking-widest font-mono">
                            {r.verificationOtp}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Your volunteer must state this code to kitchen coordinator {r.donor?.name}.
                          </p>
                        </div>

                        {/* Status Updater Action */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Confirm 4-digit OTP"
                            value={otpInputs[r._id] || ''}
                            onChange={(e) =>
                              setOtpInputs((prev) => ({ ...prev, [r._id]: e.target.value }))
                            }
                            maxLength={4}
                            className="w-32 px-3 py-2 text-xs font-mono font-bold text-center border border-slate-300 rounded-xl"
                          />
                          <button
                            onClick={() => handleLifecycleUpdate(r._id, 'Picked Up')}
                            disabled={actionInProgressId === r._id}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition whitespace-nowrap"
                          >
                            Mark Picked Up
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. PICKUP TRACKING TAB */}
          {activeSection === 'tracking' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Active Pickup Runs & Final Delivery</h3>
                <p className="text-xs text-slate-500">
                  Manage batches currently in transit and confirm final distribution to beneficiaries.
                </p>
              </div>

              {pickedUpRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Truck className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">No batches currently in transit</p>
                  <p className="text-xs">When your volunteer marks a batch picked up, complete delivery here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pickedUpRequests.map((r) => (
                    <div
                      key={r._id}
                      className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                            In Transit to Shelter
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1">
                            {r.donation?.foodName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Volunteer {r.volunteerName} ({r.volunteerPhone}) is transporting this batch.
                          </p>
                        </div>

                        <button
                          onClick={() => handleLifecycleUpdate(r._id, 'Delivered')}
                          disabled={actionInProgressId === r._id}
                          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm Delivered & Distributed</span>
                        </button>
                      </div>

                      {r.donation?._id && (
                        <div className="pt-2 border-t border-purple-100">
                          <TrackingTimeline donationId={r.donation._id} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. ORGANISATION PROFILE TAB */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Organisation Profile</h3>
                <p className="text-xs text-slate-500">
                  Update shelter capacity, verification registration, and coordinator contacts.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Charity / NGO Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.organizationName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, organizationName: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Director / Contact Person
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Beneficiary Capacity (People)
                    </label>
                    <input
                      type="number"
                      value={profileForm.beneficiaryCapacity}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          beneficiaryCapacity: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                      required
                    />
                    <span className="text-[11px] text-slate-400">
                      Helps FoodBridge AI recommend appropriately sized surplus batches.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Helpline Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={profileForm.pinCode}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, pinCode: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Distribution Center Address
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          )}

          {/* 8. SETTINGS TAB */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">NGO Preferences & Alerts</h3>
                <p className="text-xs text-slate-500">
                  Configure alert frequencies for local surplus listings.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Urgent Food Alert SMS
                    </h4>
                    <p className="text-xs text-slate-500">
                      Receive immediate SMS when a kitchen lists food expiring within 3 hours.
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Daily Morning Surplus Digest
                    </h4>
                    <p className="text-xs text-slate-500">
                      Email digest of bakery and raw grocery batches available for pickup.
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
              </div>

              <button
                onClick={() => showToast('Preferences updated!', 'success')}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs transition"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Request Food Modal */}
      {selectedDonation && (
        <RequestModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDonation(null);
          }}
          donation={selectedDonation}
          onSuccess={() => {
            fetchDashboardData();
            setActiveSection('requests');
          }}
        />
      )}
    </div>
  );
};

export default NgoDashboard;
