import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  Edit,
  XCircle,
  Eye,
  Building,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Brain,
  X,
  MapPin,
  Settings,
  User as UserIcon,
  LogOut,
  Layers,
  FileText,
  Search,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import TrackingTimeline from '../components/TrackingTimeline';
import { donationService } from '../services/donationService';
import { requestService } from '../services/requestService';
import { aiService } from '../services/aiService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Sidebar navigation tabs:
  // 'overview' | 'my-donations' | 'requests' | 'tracking' | 'profile' | 'settings'
  const [activeSection, setActiveSection] = useState('overview');

  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Edit donation modal state
  const [editingDonation, setEditingDonation] = useState(null);
  const [editForm, setEditForm] = useState({
    foodName: '',
    quantity: '',
    servings: '',
    description: '',
  });

  // AI Matching state
  const [aiMatchDonation, setAiMatchDonation] = useState(null);
  const [aiMatches, setAiMatches] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Selected donation for detailed tracking view
  const [trackingDonationId, setTrackingDonationId] = useState(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organizationName: user?.organizationName || '',
    organizationType: user?.organizationType || 'Hotel',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || 'Karnataka',
    pinCode: user?.pinCode || '560001',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    emailAlerts: true,
    instantSmsUpdates: true,
    autoAcceptNearbyVerifiedNgos: false,
  });

  const fetchMyDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await donationService.getMyDonations();
      setDonations(res.donations || []);
      if (res.donations && res.donations.length > 0 && !trackingDonationId) {
        setTrackingDonationId(res.donations[0]._id);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not load your donations', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, trackingDonationId]);

  useEffect(() => {
    fetchMyDonations();
  }, [fetchMyDonations]);

  // Handle responding to an NGO request
  const handleRespondToRequest = async (requestId, action) => {
    try {
      setActionInProgressId(requestId);
      const res = await requestService.respondToRequest(
        requestId,
        action,
        action === 'accept'
          ? 'Accepted by donor kitchen. Please pick up on schedule.'
          : 'Kitchen unavailable for this schedule.'
      );
      showToast(res.message || `Request ${action}ed!`, 'success');
      await fetchMyDonations();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Action failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle cancelling a donation
  const handleCancelDonation = async (donationId) => {
    const confirm = window.confirm('Are you sure you want to cancel this surplus food listing?');
    if (!confirm) return;

    try {
      setActionInProgressId(donationId);
      await donationService.cancelDonation(donationId, 'Cancelled by donor organization');
      showToast('Donation cancelled successfully', 'info');
      await fetchMyDonations();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to cancel donation', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle deleting a donation
  const handleDeleteDonation = async (donationId) => {
    const confirm = window.confirm('Are you sure you want to permanently delete this listing?');
    if (!confirm) return;

    try {
      setActionInProgressId(donationId);
      await donationService.deleteDonation(donationId);
      showToast('Listing removed permanently', 'info');
      await fetchMyDonations();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete donation', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle opening edit modal
  const handleOpenEdit = (donation) => {
    setEditingDonation(donation);
    setEditForm({
      foodName: donation.foodName,
      quantity: donation.quantity,
      servings: donation.servings,
      description: donation.description || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDonation) return;

    try {
      setActionInProgressId(editingDonation._id);
      await donationService.updateDonation(editingDonation._id, {
        foodName: editForm.foodName,
        quantity: editForm.quantity,
        servings: Number(editForm.servings),
        description: editForm.description,
      });
      showToast('Donation details updated successfully!', 'success');
      setEditingDonation(null);
      await fetchMyDonations();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Fetch AI Smart Matching for a specific donation
  const handleShowAiMatching = async (donation) => {
    setAiMatchDonation(donation);
    setIsLoadingAi(true);
    setAiMatches(null);
    try {
      const res = await aiService.getRecommendations({ donationId: donation._id });
      setAiMatches(res.data);
    } catch (err) {
      showToast('Could not load AI recommendations', 'error');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Save profile updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await authService.updateProfile(profileForm);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Profile update failed', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Compute statistics
  const totalDonations = donations.length;
  const pendingRequestsTotal = donations.reduce(
    (sum, d) => sum + (d.pendingRequestsCount || 0),
    0
  );
  const acceptedDonations = donations.filter((d) =>
    ['Accepted', 'Ready for Pickup', 'Picked Up'].includes(d.status)
  ).length;
  const completedDonations = donations.filter((d) =>
    ['Delivered', 'Completed'].includes(d.status)
  ).length;

  // Flattened requests list across all my donations
  const allRequests = donations.flatMap((d) =>
    (d.requests || []).map((r) => ({ ...r, parentDonation: d }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold">
            <Building className="w-3.5 h-3.5 text-brand-600" />
            <span>Donor Kitchen Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {user?.organizationName || `${user?.name}'s Kitchen`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {user?.organizationType} • {user?.city}, {user?.state || 'Karnataka'}
          </p>
        </div>

        <Link
          to="/donate"
          className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 transition flex items-center gap-2 group flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Post New Food Donation</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-4 space-y-2 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Donor Dashboard
          </div>

          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'overview'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>

          <Link
            to="/donate"
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4 text-brand-600" />
              <span>Donate Food</span>
            </div>
            <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">
              New
            </span>
          </Link>

          <button
            onClick={() => setActiveSection('my-donations')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'my-donations'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UtensilsCrossed className="w-4 h-4" />
              <span>My Donations</span>
            </div>
            <span className="text-xs font-bold text-slate-500">{totalDonations}</span>
          </button>

          <button
            onClick={() => setActiveSection('requests')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'requests'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>NGO Requests</span>
            </div>
            {pendingRequestsTotal > 0 && (
              <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full">
                {pendingRequestsTotal}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('tracking')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              activeSection === 'tracking'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4" />
              <span>Donation Tracking</span>
            </div>
          </button>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Account
            </div>

            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeSection === 'profile'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeSection === 'settings'
                  ? 'bg-brand-50 text-brand-700'
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

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* 1. OVERVIEW TAB */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Donations
                  </p>
                  <p className="text-2xl font-black text-slate-900">{totalDonations}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-black text-slate-900">{pendingRequestsTotal}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Accepted Donations
                  </p>
                  <p className="text-2xl font-black text-slate-900">{acceptedDonations}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <Truck className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-2xl font-black text-slate-900">{completedDonations}</p>
                </div>
              </div>

              {/* Quick Action: Pending Requests Alert */}
              {pendingRequestsTotal > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        You have {pendingRequestsTotal} pending NGO claims awaiting response!
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Review volunteer pickup proposals before deadlines expire.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('requests')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Review Claims
                  </button>
                </div>
              )}

              {/* Active Donations Quick List */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Active Food Listings</h3>
                  <button
                    onClick={() => setActiveSection('my-donations')}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {isLoading ? (
                  <p className="text-xs text-slate-400">Loading listings...</p>
                ) : donations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-semibold">No food donations listed yet.</p>
                    <Link
                      to="/donate"
                      className="inline-block text-xs font-bold text-brand-600 underline"
                    >
                      Post your first surplus batch
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {donations.slice(0, 4).map((d) => (
                      <div key={d._id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={d.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                            alt={d.foodName}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {d.foodName}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {d.servings} servings ({d.quantity} {d.quantityUnit || ''}) • {d.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={d.status} />
                          <button
                            onClick={() => handleShowAiMatching(d)}
                            className="p-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                            title="AI Match NGOs"
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. MY DONATIONS TAB */}
          {activeSection === 'my-donations' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">My Food Donations</h3>
                  <p className="text-xs text-slate-500">
                    Manage active listings, edit eligible records, and review NGO requests.
                  </p>
                </div>
                <Link
                  to="/donate"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Donation</span>
                </Link>
              </div>

              {donations.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">No surplus donations created yet</p>
                  <Link
                    to="/donate"
                    className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
                  >
                    + Post First Food Listing
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((d) => (
                    <div
                      key={d._id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-200 transition space-y-4"
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
                              {d.servings} Servings ({d.quantity} {d.quantityUnit || ''}) • {d.category}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>Pickup Window: {d.pickupStartTime || '12:00'} - {d.pickupEndTime || '18:00'}</span>
                              <span>•</span>
                              <span>Expires: {new Date(d.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <StatusBadge status={d.status} />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleShowAiMatching(d)}
                            className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition flex items-center gap-1.5"
                          >
                            <Brain className="w-3.5 h-3.5" />
                            <span>AI Smart Match</span>
                          </button>

                          <Link
                            to={`/donations/${d._id}`}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Public View</span>
                          </Link>
                        </div>

                        <div className="flex items-center gap-2">
                          {['Available', 'Draft'].includes(d.status) && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(d)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleCancelDonation(d._id)}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteDonation(d._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. NGO REQUESTS TAB */}
          {activeSection === 'requests' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">NGO Pickup Claims & Requests</h3>
                <p className="text-xs text-slate-500">
                  Review claims submitted by charitable organizations and authorize pickups.
                </p>
              </div>

              {allRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">No requests received yet</p>
                  <p className="text-xs">When an NGO claims your food donation, their details will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {req.ngo?.organizationName || req.ngo?.name || 'NGO Partner'}
                            </h4>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-semibold text-brand-700">
                              For: "{req.parentDonation?.foodName}"
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Requested {req.requestedQuantity || req.servingsRequested} servings for {req.beneficiaries || req.requestedQuantity} beneficiaries
                          </p>
                        </div>

                        <StatusBadge status={req.status} />
                      </div>

                      {/* Volunteer & Vehicle details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-600">
                        <div>
                          <span className="font-bold text-slate-400 block text-[10px] uppercase">
                            Volunteer
                          </span>
                          <span>{req.volunteerName}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 block text-[10px] uppercase">
                            Volunteer Phone
                          </span>
                          <span>{req.volunteerPhone}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 block text-[10px] uppercase">
                            Pickup Time
                          </span>
                          <span>{req.pickupTime || req.proposedPickupTime}</span>
                        </div>
                      </div>

                      {req.message && (
                        <p className="text-xs text-slate-600 italic">
                          "{req.message}"
                        </p>
                      )}

                      {/* Verification OTP Display for Accepted Batch */}
                      {req.status === 'Accepted' && (
                        <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-brand-800 block">
                              Verification OTP (Verify with Driver upon collection)
                            </span>
                            <span className="text-lg font-black tracking-widest text-brand-900">
                              {req.verificationOtp}
                            </span>
                          </div>
                          <span className="text-[11px] text-brand-700 font-semibold">
                            Ask volunteer driver to state this OTP
                          </span>
                        </div>
                      )}

                      {/* Actions for Pending Requests */}
                      {req.status === 'Pending' && (
                        <div className="pt-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRespondToRequest(req._id, 'reject')}
                            disabled={actionInProgressId === req._id}
                            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespondToRequest(req._id, 'accept')}
                            disabled={actionInProgressId === req._id}
                            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            Accept & Authorize Pickup
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. DONATION TRACKING TAB */}
          {activeSection === 'tracking' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Donation Tracking Timeline</h3>
                <p className="text-xs text-slate-500">
                  End-to-end transparent lifecycle tracking from kitchen listing to beneficiary handoff.
                </p>
              </div>

              {donations.length === 0 ? (
                <p className="text-xs text-slate-400">No active listings to track.</p>
              ) : (
                <div className="space-y-6">
                  {/* Donation selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {donations.map((d) => (
                      <button
                        key={d._id}
                        onClick={() => setTrackingDonationId(d._id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                          trackingDonationId === d._id
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {d.foodName.slice(0, 24)}...
                      </button>
                    ))}
                  </div>

                  {/* Tracking Timeline Component */}
                  {trackingDonationId && (
                    <TrackingTimeline donationId={trackingDonationId} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 5. PROFILE TAB */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Kitchen & Donor Profile</h3>
                <p className="text-xs text-slate-500">
                  Update your organization address and coordinator contact numbers.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization / Hotel Name
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
                      Primary Contact Person
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, state: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
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
                    Pickup Street Address
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
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* 6. SETTINGS TAB */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Donor Kitchen Settings</h3>
                <p className="text-xs text-slate-500">
                  Configure alerts and platform operational preferences.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Email Notifications
                    </h4>
                    <p className="text-xs text-slate-500">
                      Receive instant emails when an NGO claims your surplus meals.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, emailAlerts: e.target.checked }))
                    }
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Pickup Reminder Alerts
                    </h4>
                    <p className="text-xs text-slate-500">
                      Send SMS reminders to volunteer drivers 30 minutes before pickup deadline.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.instantSmsUpdates}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, instantSmsUpdates: e.target.checked }))
                    }
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Auto-Match Nearby Verified NGOs
                    </h4>
                    <p className="text-xs text-slate-500">
                      Allow FoodBridge to notify top-ranked NGOs within 5 km immediately upon posting.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoAcceptNearbyVerifiedNgos}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        autoAcceptNearbyVerifiedNgos: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                </div>
              </div>

              <button
                onClick={() => showToast('Preferences updated!', 'success')}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition"
              >
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Food Listing</h3>
              <button
                onClick={() => setEditingDonation(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Food Title</label>
                <input
                  type="text"
                  value={editForm.foodName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, foodName: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Servings</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.servings}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, servings: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI MATCHING RECOMMENDATION MODAL */}
      {aiMatchDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setAiMatchDonation(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-brand-700">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  AI Smart Food Matching Engine
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Top Recommended NGOs for "{aiMatchDonation.foodName}"
                </h3>
              </div>
            </div>

            {isLoadingAi ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Running heuristic matching algorithm...</p>
              </div>
            ) : aiMatches ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Found <strong>{aiMatches.totalEligibleNgos || aiMatches.recommendations?.length}</strong> eligible NGOs ranked by proximity, beneficiary capacity, and food category preference:
                </p>

                <div className="space-y-3">
                  {aiMatches.recommendations?.map((rec) => (
                    <div
                      key={rec.ngo._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-300 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {rec.ngo.organizationName || rec.ngo.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {rec.ngo.organizationType} • {rec.ngo.city}
                            {rec.distanceKm !== null && ` (${rec.distanceKm} km away)`}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                          {rec.matchScore}% Match
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        {rec.reasons?.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No matching recommendations found.</p>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setAiMatchDonation(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
              >
                Close Matches
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
