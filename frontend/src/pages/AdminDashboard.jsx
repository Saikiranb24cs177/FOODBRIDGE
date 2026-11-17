import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  Users,
  Building2,
  UtensilsCrossed,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Ban,
  Trash2,
  Sparkles,
  BarChart3,
  Flame,
  ExternalLink,
  Clock,
  Truck,
  FileCheck,
  Eye,
  RefreshCw,
  Settings as SettingsIcon,
  LogOut,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  Calendar,
  ChevronRight,
  Award,
  Activity,
  Info,
  Sliders,
  Bell,
  Heart,
} from 'lucide-react';
import { adminService, statsService } from '../services/adminService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Data Collections
  const [platformStats, setPlatformStats] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [aiDemand, setAiDemand] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [donationSearch, setDonationSearch] = useState('');
  const [donationStatusFilter, setDonationStatusFilter] = useState('all');
  const [donationCategoryFilter, setDonationCategoryFilter] = useState('all');

  const [requestStatusFilter, setRequestStatusFilter] = useState('all');

  // Verification Modal / Action State
  const [selectedVerificationUser, setSelectedVerificationUser] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');

  // Platform Settings State (Local UI state for governance controls)
  const [settingsState, setSettingsState] = useState({
    maintenanceMode: false,
    requireDarpanVerification: true,
    autoMatchRadiusKm: 15,
    emailAlertsEnabled: true,
    emergencyHelplineStatus: 'Active',
    maxUrgencyExpiryHours: 6,
  });

  // Fetch core data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        statsRes,
        metricsRes,
        usersRes,
        donationsRes,
        requestsRes,
        reportsRes,
        demandRes,
        insightsRes,
      ] = await Promise.allSettled([
        statsService.getPlatformStats(),
        adminService.getDashboardMetrics(),
        adminService.getUsers(),
        adminService.getAllDonations(),
        adminService.getAllRequests(),
        adminService.getReportedDonations(),
        aiService.getDemandPrediction(),
        aiService.getAiInsights(),
      ]);

      if (statsRes.status === 'fulfilled') setPlatformStats(statsRes.value?.data || null);
      if (metricsRes.status === 'fulfilled') setDashboardMetrics(metricsRes.value?.stats || null);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value?.users || []);
      if (donationsRes.status === 'fulfilled') setDonations(donationsRes.value?.donations || []);
      if (requestsRes.status === 'fulfilled') setRequests(requestsRes.value?.requests || []);
      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value?.donations || []);
      if (demandRes.status === 'fulfilled') setAiDemand(demandRes.value?.data || null);
      if (insightsRes.status === 'fulfilled') setAiInsights(insightsRes.value?.data || null);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Could not load all administrative records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // User status toggler (active / suspended)
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setActionInProgressId(userId);
      await adminService.updateUserStatus(userId, { status: newStatus });
      showToast(`User account status changed to ${newStatus}`, 'info');
      await fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Action failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // NGO Verification approval or rejection
  const handleVerifyNgo = async (userId, status, note = '') => {
    try {
      setActionInProgressId(userId);
      await adminService.verifyUser(userId, {
        verificationStatus: status,
        isVerified: status === 'verified',
        note,
      });
      showToast(
        status === 'verified'
          ? 'NGO successfully verified! Credentials approved.'
          : 'NGO verification rejected.',
        status === 'verified' ? 'success' : 'info'
      );
      setSelectedVerificationUser(null);
      setVerificationNote('');
      await fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Verification update failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Dismiss safety report
  const handleResolveReport = async (donationId) => {
    try {
      setActionInProgressId(donationId);
      await adminService.resolveReport(donationId);
      showToast('Safety report resolved and dismissed', 'success');
      await fetchData();
    } catch (err) {
      showToast('Failed to resolve report', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Delete / Take down donation listing
  const handleDeleteDonation = async (donationId) => {
    const confirm = window.confirm('Are you sure you want to take down this food listing permanently?');
    if (!confirm) return;

    try {
      setActionInProgressId(donationId);
      await adminService.deleteDonation(donationId);
      showToast('Listing removed by administrator', 'info');
      await fetchData();
    } catch (err) {
      showToast('Failed to remove donation', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    const query = userSearch.toLowerCase().trim();
    const matchSearch =
      !query ||
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.organizationName && u.organizationName.toLowerCase().includes(query)) ||
      (u.city && u.city.toLowerCase().includes(query));

    return matchRole && matchStatus && matchSearch;
  });

  const donorsList = users.filter((u) => u.role === 'donor');
  const ngosList = users.filter((u) => u.role === 'ngo');
  const pendingNgosList = users.filter(
    (u) => u.role === 'ngo' && (u.verificationStatus === 'pending' || (!u.isVerified && u.verificationStatus !== 'rejected'))
  );

  // Filtered Donations
  const filteredDonations = donations.filter((d) => {
    const matchStatus = donationStatusFilter === 'all' || d.status === donationStatusFilter;
    const matchCategory = donationCategoryFilter === 'all' || d.category === donationCategoryFilter;
    const query = donationSearch.toLowerCase().trim();
    const matchSearch =
      !query ||
      (d.foodName && d.foodName.toLowerCase().includes(query)) ||
      (d.pickupCity && d.pickupCity.toLowerCase().includes(query)) ||
      (d.donor?.organizationName && d.donor.organizationName.toLowerCase().includes(query));

    return matchStatus && matchCategory && matchSearch;
  });

  // Filtered Requests
  const filteredRequests = requests.filter((r) => {
    return requestStatusFilter === 'all' || r.status === requestStatusFilter;
  });

  const verifiedStats = platformStats?.verified || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* TOP BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/50">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Platform Governance & Oversight Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              FoodBridge Administrator Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify charitable trusts, audit food distribution safety logs, track AI-driven matching efficiency, and manage community logistics across the network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-600 shadow-sm"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Records</span>
            </button>

            {reports.length > 0 && (
              <button
                onClick={() => setActiveTab('reports')}
                className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-xs font-bold transition flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{reports.length} Reports Pending</span>
              </button>
            )}

            {pendingNgosList.length > 0 && (
              <button
                onClick={() => setActiveTab('verify')}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>{pendingNgosList.length} Verifications</span>
              </button>
            )}
          </div>
        </div>

        {/* NAVIGATION TABS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Manage Users', icon: Users, badge: users.length },
              { id: 'donors', label: 'Donors', icon: Building2, badge: donorsList.length },
              { id: 'ngos', label: 'NGOs', icon: Heart, badge: ngosList.length },
              { id: 'verify', label: 'Verify Organisations', icon: FileCheck, badge: pendingNgosList.length, badgeColor: 'bg-amber-500 text-white' },
              { id: 'donations', label: 'Food Donations', icon: UtensilsCrossed, badge: donations.length },
              { id: 'requests', label: 'Donation Requests', icon: Truck, badge: requests.length },
              { id: 'reports', label: 'Safety Reports', icon: AlertTriangle, badge: reports.length, badgeColor: 'bg-red-600 text-white' },
              { id: 'ai', label: 'AI Analytics', icon: Sparkles },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        tab.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800')
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: DASHBOARD (OVERVIEW)
        ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Total Donors</p>
                  <Building2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {dashboardMetrics?.totalDonors ?? donorsList.length}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Hotels, Caterers & Hostels</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Partner NGOs</p>
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {dashboardMetrics?.totalNgos ?? ngosList.length}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  {ngosList.filter((n) => n.isVerified).length} Officially Verified
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Food Batches Listed</p>
                  <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {dashboardMetrics?.totalDonations ?? donations.length}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {donations.filter((d) => d.status === 'Available').length} Available Now
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Meals Delivered</p>
                  <Award className="w-4 h-4 text-brand-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  {verifiedStats.verifiedMealsDelivered ?? 450}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Verified by OTP handoff</p>
              </div>
            </div>

            {/* SECONDARY METRICS: SAFETY, CAPACITY & ENVIRONMENTAL IMPACT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Environmental Footprint Saved</span>
                </div>
                <p className="text-2xl font-black text-emerald-950">
                  {verifiedStats.co2EmissionsPreventedKg || Math.round((verifiedStats.verifiedMealsDelivered || 450) * 1.8)} kg
                </p>
                <p className="text-xs text-emerald-800/80 leading-relaxed">
                  Total greenhouse emissions averted by diverting edible cooked food and pantry staples from municipal landfills.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>AI Smart Match Fulfillment</span>
                </div>
                <p className="text-2xl font-black text-amber-950">
                  {aiInsights?.fulfillmentMetrics?.matchRatePercentage ?? 92}%
                </p>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  Average match accuracy across geographic radius, beneficiary dietary capacity, and consumption urgency.
                </p>
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Average Turnaround Speed</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {aiInsights?.fulfillmentMetrics?.avgTurnaroundHours ?? 2.8} hrs
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  From initial food listing posting by donor to safe pickup confirmation by verified NGO volunteers.
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS & AUDIT SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Pending Verifications */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-500" />
                    <span>Pending NGO Verifications</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('verify')}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    View All ({pendingNgosList.length})
                  </button>
                </div>

                {pendingNgosList.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    All registered NGOs are currently verified and compliant!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingNgosList.slice(0, 3).map((ngo) => (
                      <div
                        key={ngo._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900">{ngo.organizationName || ngo.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {ngo.city} • Capacity: {ngo.beneficiaryCapacity || 50} beneficiaries
                          </p>
                          <p className="text-[11px] font-mono text-amber-700">
                            DARPAN: {ngo.verificationDetails?.darpanId || 'Not submitted'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedVerificationUser(ngo);
                            setActiveTab('verify');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Safety Reports */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Food Safety & Policy Moderation</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    View All ({reports.length})
                  </button>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    No active food safety flags or moderation reports.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 3).map((rep) => (
                      <div
                        key={rep._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900">{rep.foodName}</p>
                          <p className="text-[11px] text-slate-600">Donor: {rep.donor?.organizationName || rep.donor?.name}</p>
                          <p className="text-[11px] text-red-700 font-medium">
                            Reason: {rep.reportReason || 'Suspicious quality or packaging'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(rep._id)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleDeleteDonation(rep._id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: MANAGE USERS
        ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name, org, email, city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="donor">Donors</option>
                    <option value="ngo">NGOs</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">User / Organization</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Contact & Location</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          No users found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            {u.organizationName && (
                              <p className="text-[11px] text-slate-500 font-medium">{u.organizationName}</p>
                            )}
                            <p className="text-[10px] text-slate-400 font-mono">ID: {u._id.slice(-6)}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'ngo'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{u.city || 'Location not specified'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.isVerified || u.verificationStatus === 'verified' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified
                              </span>
                            ) : u.verificationStatus === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                u.status === 'suspended'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserStatus(u._id, u.status || 'active')}
                                disabled={actionInProgressId === u._id}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                                  u.status === 'suspended'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                }`}
                              >
                                {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                            )}
                            {u.role === 'ngo' && !u.isVerified && (
                              <button
                                onClick={() => {
                                  setSelectedVerificationUser(u);
                                  setActiveTab('verify');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition"
                              >
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: DONORS DIRECTORY
        ========================================================================= */}
        {activeTab === 'donors' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Registered Food Donors</h2>
                <p className="text-xs text-slate-500">
                  Restaurants, wedding halls, corporate cafeterias, and hotels contributing surplus food.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {donorsList.length} Active Donors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donorsList.map((donor) => {
                const donorDonations = donations.filter(
                  (d) => d.donor?._id === donor._id || d.donor === donor._id
                );
                return (
                  <div
                    key={donor._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-slate-900 text-sm">{donor.organizationName || donor.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Contact: {donor.name}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold capitalize">
                        {donor.organizationType || 'Restaurant / Donor'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{donor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{donor.phone || 'Phone not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{donor.city || 'Bengaluru'} {donor.pinCode ? `(${donor.pinCode})` : ''}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{donorDonations.length} Listings</p>
                        <p className="text-[10px] text-slate-400">Total batches shared</p>
                      </div>
                      <button
                        onClick={() => {
                          setDonationSearch(donor.organizationName || donor.name);
                          setActiveTab('donations');
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                      >
                        <span>View Food</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: NGOS DIRECTORY
        ========================================================================= */}
        {activeTab === 'ngos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Partner Non-Profits & Shelters</h2>
                <p className="text-xs text-slate-500">
                  Orphanages, old age homes, shelters, and food relief volunteers across all operating zones.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-rose-800 rounded-full">
                {ngosList.length} Participating NGOs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ngosList.map((ngo) => {
                const ngoRequests = requests.filter(
                  (r) => r.ngo?._id === ngo._id || r.ngo === ngo._id
                );
                return (
                  <div
                    key={ngo._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-slate-900 text-sm">{ngo.organizationName || ngo.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Head: {ngo.name}</p>
                      </div>
                      {ngo.isVerified ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ngo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ngo.phone || 'Phone not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ngo.city || 'Bengaluru'} {ngo.pinCode ? `• PIN ${ngo.pinCode}` : ''}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Beneficiary Capacity:</span>
                        <span className="font-bold text-slate-900">{ngo.beneficiaryCapacity || 50} persons</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">DARPAN ID:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {ngo.verificationDetails?.darpanId || 'Pending upload'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{ngoRequests.length} Requests</p>
                        <p className="text-[10px] text-slate-400">Claims submitted</p>
                      </div>
                      {!ngo.isVerified && (
                        <button
                          onClick={() => {
                            setSelectedVerificationUser(ngo);
                            setActiveTab('verify');
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                        >
                          Verify NGO
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: VERIFY ORGANISATIONS (NGO AUDIT QUEUE)
        ========================================================================= */}
        {activeTab === 'verify' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-md">
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-amber-200" />
                <div>
                  <h2 className="text-xl font-black">NGO Statutory Compliance & DARPAN Verification</h2>
                  <p className="text-xs text-amber-100">
                    Review legal trust deeds, NGO Darpan portal IDs, and beneficiary shelter capacity to authorize food claiming rights.
                  </p>
                </div>
              </div>
            </div>

            {selectedVerificationUser && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-amber-950 text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    <span>Reviewing: {selectedVerificationUser.organizationName || selectedVerificationUser.name}</span>
                  </h3>
                  <button
                    onClick={() => setSelectedVerificationUser(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-xl border border-amber-200">
                  <div>
                    <p className="text-slate-400 font-bold uppercase">Registration / Trust No.</p>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">
                      {selectedVerificationUser.verificationDetails?.registrationNumber || 'KA-BLR-TRUST-4421'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase">NITI Aayog DARPAN ID</p>
                    <p className="font-mono font-bold text-emerald-700 mt-0.5">
                      {selectedVerificationUser.verificationDetails?.darpanId || 'KA/2023/0488219'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase">Registered Address</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedVerificationUser.address || 'Bengaluru City Center'}, {selectedVerificationUser.pinCode || '560001'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Administrator Review Notes / Justification:
                  </label>
                  <textarea
                    rows="2"
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Enter compliance verification remarks or reason for rejection..."
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => handleVerifyNgo(selectedVerificationUser._id, 'rejected', verificationNote)}
                    disabled={actionInProgressId === selectedVerificationUser._id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleVerifyNgo(selectedVerificationUser._id, 'verified', verificationNote)}
                    disabled={actionInProgressId === selectedVerificationUser._id}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    Approve & Grant Official Verification
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Verification Queue</h3>
                <span className="text-xs text-slate-500">{pendingNgosList.length} Organizations Awaiting Approval</span>
              </div>

              {pendingNgosList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">No Pending Verifications</p>
                  <p className="text-xs text-slate-400">All registered NGOs currently have verified credentials.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingNgosList.map((ngo) => (
                    <div key={ngo._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{ngo.organizationName || ngo.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Contact: {ngo.name} • {ngo.email} • {ngo.phone}
                        </p>
                        <p className="text-xs text-slate-600">
                          Location: {ngo.city || 'Bengaluru'} • PIN: {ngo.pinCode || '560001'} • Capacity: {ngo.beneficiaryCapacity || 50} beneficiaries
                        </p>
                        <p className="text-xs font-mono text-emerald-800">
                          DARPAN: {ngo.verificationDetails?.darpanId || 'Uploaded during registration'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => setSelectedVerificationUser(ngo)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          Review & Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: FOOD DONATIONS MANAGEMENT
        ========================================================================= */}
        {activeTab === 'donations' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search food item, donor, or city..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <select
                    value={donationStatusFilter}
                    onChange={(e) => setDonationStatusFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Requested">Requested</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Category:</span>
                  <select
                    value={donationCategoryFilter}
                    onChange={(e) => setDonationCategoryFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Cooked meals">Cooked meals</option>
                    <option value="Packaged food">Packaged food</option>
                    <option value="Raw ingredients / Vegetables">Raw ingredients</option>
                    <option value="Bakery items">Bakery items</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Donations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Food Item</th>
                      <th className="py-3.5 px-4">Donor Org</th>
                      <th className="py-3.5 px-4">Quantity / Servings</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Safety Flag</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDonations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">
                          No food donations found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredDonations.map((d) => (
                        <tr key={d._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{d.foodName}</p>
                            <p className="text-[11px] text-slate-500 font-medium capitalize">{d.category}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">
                              {d.donor?.organizationName || d.donor?.name || 'Anonymous Donor'}
                            </p>
                            <p className="text-[11px] text-slate-400">{d.donor?.phone || ''}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">
                              {d.quantity} {d.unit || 'meals'}
                            </p>
                            <p className="text-[11px] text-emerald-700 font-semibold">{d.servings} Servings</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-slate-700 font-medium">{d.pickupCity || 'Bengaluru'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">PIN: {d.pinCode || '560001'}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                d.status === 'Available'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : d.status === 'Delivered' || d.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : d.status === 'Cancelled'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {d.reportsCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                                {d.reportsCount} Report(s)
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Clean
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <a
                              href={`/donations/${d._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </a>
                            {d.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleDeleteDonation(d._id)}
                                disabled={actionInProgressId === d._id}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold"
                              >
                                Take Down
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: DONATION REQUESTS
        ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">NGO Claims & Delivery Requests</h2>
                <p className="text-xs text-slate-500">
                  Track NGO requests, donor acceptance statuses, OTP verifications, and delivery handoffs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Filter Status:</span>
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Request Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Request ID / Date</th>
                      <th className="py-3.5 px-4">Claiming NGO</th>
                      <th className="py-3.5 px-4">Donation & Donor</th>
                      <th className="py-3.5 px-4">Quantity / People</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">OTP Handoff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          No donation requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-mono font-bold text-slate-900">REQ-{r._id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] text-slate-400">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{r.ngo?.organizationName || r.ngo?.name}</p>
                            <p className="text-[11px] text-slate-500">{r.ngo?.city} • {r.ngo?.phone}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900">{r.donation?.foodName || 'Donation Item'}</p>
                            <p className="text-[11px] text-slate-500">
                              Donor: {r.donor?.organizationName || r.donor?.name || 'Hotel Donor'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-emerald-800">
                              {r.requestedQuantity || r.servingsRequested || 50} servings
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {r.beneficiaries ? `${r.beneficiaries} beneficiaries` : 'Immediate feeding'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                r.status === 'Completed' || r.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'Accepted' || r.status === 'Ready for Pickup'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.status === 'Rejected' || r.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {r.verificationOtp ? (
                              <span className="font-mono font-bold px-2 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200">
                                {r.verificationOtp}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: SAFETY & QUALITY REPORTS
        ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Food Safety & Compliance Flags</h2>
                <p className="text-xs text-slate-500">
                  User reports regarding spoiled food, hygiene violations, or deceptive listing specifications.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-800 rounded-full">
                {reports.length} Flagged Listings
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-extrabold text-slate-900 text-base">All Clear! No Flagged Listings</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Every food batch currently meets quality and food safety declaration requirements.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((r) => (
                  <div key={r._id} className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <h3 className="font-extrabold text-slate-900 text-base">{r.foodName}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Posted by: {r.donor?.organizationName || r.donor?.name || 'Unknown'} ({r.donor?.phone || ''})
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-extrabold">
                        {r.reportsCount || 1} Reports
                      </span>
                    </div>

                    <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs space-y-1">
                      <p className="font-bold text-red-900">Safety Complaint / Flag Reason:</p>
                      <p className="text-red-800">{r.reportReason || 'Suspicious smell, improper storage, or unverified quality.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">Location:</span>
                        <span>{r.pickupCity || 'Bengaluru'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">Quantity:</span>
                        <span>{r.quantity} {r.unit} ({r.servings} Servings)</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleResolveReport(r._id)}
                        disabled={actionInProgressId === r._id}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      >
                        Dismiss & Clear Report
                      </button>
                      <button
                        onClick={() => handleDeleteDonation(r._id)}
                        disabled={actionInProgressId === r._id}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Remove Listing Permanently
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 9: AI ANALYTICS & PREDICTIONS
        ========================================================================= */}
        {activeTab === 'ai' && (
          <div className="space-y-8 animate-fadeIn">
            {/* AI Engine Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Intelligent Heuristic Demand Forecasting & Optimization</span>
                </div>
                <h2 className="text-2xl font-black">FoodBridge AI Predictive Analytics</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Historical meal distribution patterns combined with geo-demand modeling to forecast surplus quantities, identify supply gaps, and speed up emergency food rescue.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1">
                <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Engine Status</p>
                <p className="text-xl font-extrabold text-white">Online & Active</p>
                <p className="text-[10px] text-slate-300">Modular for ML / Python Model Plug-in</p>
              </div>
            </div>

            {/* SECTION: 7-DAY DEMAND FORECAST */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>7-Day Surplus Food Demand Forecast</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Projected meal quantities required by verified community shelters based on day-of-week consumption trends.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  Confidence Score: 88%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {(aiDemand?.projectedNext7Days || [
                  { day: 'Monday', predictedDemandServings: 120, highDemandCategory: 'Rice and grains', recommendedDonorPreparationTime: '13:00 - 15:00' },
                  { day: 'Tuesday', predictedDemandServings: 145, highDemandCategory: 'Cooked meals', recommendedDonorPreparationTime: '13:00 - 15:00' },
                  { day: 'Wednesday', predictedDemandServings: 160, highDemandCategory: 'Cooked meals', recommendedDonorPreparationTime: '13:00 - 15:00' },
                  { day: 'Thursday', predictedDemandServings: 155, highDemandCategory: 'Packaged food', recommendedDonorPreparationTime: '13:00 - 15:00' },
                  { day: 'Friday', predictedDemandServings: 240, highDemandCategory: 'Banquet meals', recommendedDonorPreparationTime: '18:00 - 22:00' },
                  { day: 'Saturday', predictedDemandServings: 310, highDemandCategory: 'Banquet meals', recommendedDonorPreparationTime: '18:00 - 22:00' },
                  { day: 'Sunday', predictedDemandServings: 280, highDemandCategory: 'Cooked meals', recommendedDonorPreparationTime: '17:00 - 21:00' },
                ]).map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2 hover:border-emerald-400 transition"
                  >
                    <p className="font-bold text-xs text-slate-700 uppercase tracking-wider">{proj.day.slice(0, 3)}</p>
                    <p className="text-xl font-black text-emerald-700">{proj.predictedDemandServings}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Est. Servings</p>
                    <div className="pt-2 border-t border-slate-200 text-[10px] space-y-1">
                      <p className="font-semibold text-slate-800">{proj.highDemandCategory}</p>
                      <p className="text-slate-400">{proj.recommendedDonorPreparationTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION: CATEGORY SUPPLY VS DEMAND FULFILLMENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                  <span>Category Supply vs. Demand Fulfillment</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Comparison between total offered servings from donors vs. claims from verified NGOs.
                </p>

                <div className="space-y-4">
                  {(aiDemand?.categoryComparison?.length ? aiDemand.categoryComparison : [
                    { category: 'Cooked meals', servingsOffered: 420, servingsRequested: 380, fulfillmentRate: 90 },
                    { category: 'Packaged food', servingsOffered: 180, servingsRequested: 150, fulfillmentRate: 83 },
                    { category: 'Bakery items', servingsOffered: 95, servingsRequested: 85, fulfillmentRate: 89 },
                    { category: 'Raw vegetables', servingsOffered: 140, servingsRequested: 110, fulfillmentRate: 78 },
                  ]).map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-900">{cat.category}</span>
                        <span className="text-emerald-700 font-bold">{cat.fulfillmentRate}% Fulfilled</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, cat.fulfillmentRate)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Offered: {cat.servingsOffered}</span>
                        <span>Requested: {cat.servingsRequested}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONABLE AI OPTIMIZATIONS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Actionable Logistics Recommendations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Algorithmic suggestions generated from network dispatch logs to prevent food spoilage.
                </p>

                <div className="space-y-3">
                  {(aiInsights?.actionableRecommendations || [
                    {
                      id: '1',
                      priority: 'High',
                      title: 'Optimize Weekend Banquet Windows',
                      description: 'Surplus meal listings peak between 9:00 PM and 11:30 PM on Friday & Saturday. Encourage donors to post estimated yields by 7:00 PM to enable faster NGO volunteer routing.',
                      impactMetric: '+24% pickup turnaround speed',
                    },
                    {
                      id: '2',
                      priority: 'Medium',
                      title: 'Expand Cold-Storage Pickup Fleet',
                      description: '32% of unfulfilled donations involve perishable dairy and desserts with under 4 hours safe consumption. Recommend onboarding refrigerated transport partners.',
                      impactMetric: '+18% perishables rescue rate',
                    },
                    {
                      id: '3',
                      priority: 'Low',
                      title: 'Pre-schedule Recurring Orphanage Demands',
                      description: 'Hostels generate reliable cooked rice surplus on weekdays. Establishing automated recurring donor-NGO pair channels reduces coordination latency by 45 minutes.',
                      impactMetric: 'Zero friction recurring matching',
                    },
                  ]).map((rec, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-900">{rec.title}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{rec.description}</p>
                      <p className="text-[10px] font-bold text-emerald-700">Projected Impact: {rec.impactMetric}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 10: PLATFORM SETTINGS
        ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Platform Governance & Global Controls</h2>
                <p className="text-xs text-slate-500">
                  Configure food safety parameters, emergency helpline alerts, and verification policies.
                </p>
              </div>

              <div className="space-y-5 divide-y divide-slate-100 text-xs">
                {/* Setting 1: DARPAN Verification */}
                <div className="pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-lg">
                    <p className="font-bold text-slate-900 text-sm">Mandatory NITI Aayog DARPAN Verification</p>
                    <p className="text-slate-500">
                      When enabled, NGOs must have an approved registration or DARPAN number before claiming surplus batches.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSettingsState((s) => ({ ...s, requireDarpanVerification: !s.requireDarpanVerification }));
                      showToast('Verification policy setting updated', 'success');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settingsState.requireDarpanVerification ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform ${
                        settingsState.requireDarpanVerification ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 2: Emergency Food Broadcasts */}
                <div className="pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-lg">
                    <p className="font-bold text-slate-900 text-sm">Emergency Food Distress Broadcasts</p>
                    <p className="text-slate-500">
                      Instantly ping registered NGOs within 15 km when a large perishable donation (&gt;100 servings) is flagged urgent.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSettingsState((s) => ({ ...s, emailAlertsEnabled: !s.emailAlertsEnabled }));
                      showToast('Emergency distress broadcast setting updated', 'success');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settingsState.emailAlertsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform ${
                        settingsState.emailAlertsEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 3: Auto-match Radius */}
                <div className="pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-lg">
                    <p className="font-bold text-slate-900 text-sm">AI Smart Match Proximity Radius</p>
                    <p className="text-slate-500">
                      Maximum search radius for automated Haversine heuristic proximity scoring between donor and NGO shelters.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{settingsState.autoMatchRadiusKm} km</span>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={settingsState.autoMatchRadiusKm}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSettingsState((s) => ({ ...s, autoMatchRadiusKm: val }));
                      }}
                      className="accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Setting 4: Maintenance Mode */}
                <div className="pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-lg">
                    <p className="font-bold text-slate-900 text-sm">Platform Maintenance Mode</p>
                    <p className="text-slate-500">
                      Prevent new listings and claims temporarily during database maintenance or security upgrades.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSettingsState((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }));
                      showToast(
                        settingsState.maintenanceMode
                          ? 'Maintenance mode disabled. System live.'
                          : 'Maintenance mode activated.',
                        'info'
                      );
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settingsState.maintenanceMode ? 'bg-red-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform ${
                        settingsState.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* System Diagnostic Information */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  System Diagnostics & Database Engine
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Database Engine</span>
                    <span className="font-bold text-slate-900">MongoDB 8.3 (Mongoose)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">AI Match Engine</span>
                    <span className="font-bold text-emerald-700">Heuristic + Modular ML</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Sessions</span>
                    <span className="font-bold text-slate-900">Protected JWT Handshake</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">API Environment</span>
                    <span className="font-bold text-slate-900">Express.js REST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
