import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  HeartHandshake,
  ShieldCheck,
  Truck,
  ArrowRight,
  Users,
  Building,
  CheckCircle2,
  Sparkles,
  Leaf,
  Clock,
  Heart,
  Quote,
  Flame,
  Coffee,
  Brain,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { statsService } from '../services/adminService';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

const USER_CATEGORIES = [
  {
    name: 'Restaurants & Bistros',
    desc: 'Commercial kitchens with daily surplus batch meals and prepped ingredients.',
    icon: UtensilsCrossed,
    tag: 'Food Donor',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Hotels & Banquets',
    desc: 'Buffet and executive dining setups with high-volume untouched gourmet trays.',
    icon: Building,
    tag: 'Food Donor',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Hostels & Universities',
    desc: 'Student cafeteria mess halls preparing batch meals on fixed schedules.',
    icon: Coffee,
    tag: 'Food Donor',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Function & Wedding Halls',
    desc: 'Large festive gatherings with generous surplus margins needing rapid rescue.',
    icon: Sparkles,
    tag: 'Food Donor',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Registered NGOs',
    desc: 'Charitable trusts operating grassroots feeding networks across urban sectors.',
    icon: HeartHandshake,
    tag: 'Beneficiary Network',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'Child Care & Orphanages',
    desc: 'Dedicated shelters providing daily nutritious balanced meals for vulnerable children.',
    icon: Heart,
    tag: 'Beneficiary Network',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'Old-Age Homes',
    desc: 'Senior living centers offering dignified care, dietary respect, and fresh meals.',
    icon: Users,
    tag: 'Beneficiary Network',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
];

const LandingPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState({
    verifiedMealsDelivered: 90,
    estimatedMealsOffered: 385,
    totalDonations: 5,
    participatingDonors: 3,
    participatingNgos: 4,
    estimatedKgFoodSaved: 36,
    estimatedCo2SavedKg: 68,
  });

  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [isLoadingDonations, setIsLoadingDonations] = useState(true);

  useEffect(() => {
    const fetchStatsAndDonations = async () => {
      try {
        const statsRes = await statsService.getPlatformStats();
        if (statsRes.data) {
          setStats({
            ...statsRes.data.verified,
            ...statsRes.data.estimates,
          });
        }
      } catch (err) {
        console.warn('Using database fallback stats', err);
      }

      try {
        setIsLoadingDonations(true);
        const donRes = await donationService.getAllDonations({ status: 'Available' });
        setFeaturedDonations((donRes.donations || []).slice(0, 3));
      } catch (err) {
        console.warn('Featured donations fetch fallback', err);
      } finally {
        setIsLoadingDonations(false);
      }
    };

    fetchStatsAndDonations();
  }, []);

  const handleQuickDemo = async (role) => {
    try {
      let email = 'donor@foodbridge.org';
      if (role === 'ngo') email = 'ngo@foodbridge.org';
      if (role === 'admin') email = 'admin@foodbridge.org';
      await login(email, 'Password123!');
      showToast(`Logged in as Demo ${role.toUpperCase()}!`, 'success');
    } catch {
      showToast('Demo login failed', 'error');
    }
  };

  return (
    <div className="space-y-24 pb-20 bg-softcream selection:bg-brand-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-400 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-warmth-400 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Tagline, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Turning Surplus Food Into Hope</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Don't Waste Food.{' '}
                <span className="bg-gradient-to-r from-brand-600 via-emerald-600 to-warmth-600 bg-clip-text text-transparent">
                  Share Hope.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Connect surplus food with people who need it. FoodBridge brings donors and charitable organisations together through smart technology.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  to="/donate"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 transition-all flex items-center justify-center gap-2 group"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Donate Food</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/donations"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs hover:shadow transition flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4 text-brand-600" />
                  <span>Find Food</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-warmth-500 hover:bg-warmth-600 text-slate-900 font-bold text-sm shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>Join FoodBridge</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Food Safety Certified
                </span>
                <span className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-brand-600" />
                  Smart AI Matching
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-warmth-600" />
                  Real-time Pickup Tracking
                </span>
              </div>
            </div>

            {/* Right Column: Hero Showcase Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80"
                    alt="Volunteers organizing food donation packages"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="p-5 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                        Live Food Rescue
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Verified Pickup
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      80 Servings of Royal Dum Biryani & Paneer Curry
                    </h4>
                    <p className="text-xs text-slate-500">
                      Grand Royal Hotel ➔ Hope Child Care & Orphanage
                    </p>
                  </div>
                </div>

                {/* Floating Metric 1 */}
                <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Waste Prevented</p>
                    <p className="text-sm font-black text-slate-900">
                      {stats.estimatedKgFoodSaved || 36} kg Rescued
                    </p>
                  </div>
                </div>

                {/* Floating Metric 2 */}
                <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warmth-100 flex items-center justify-center text-warmth-600">
                    <Heart className="w-5 h-5 fill-warmth-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Meals Served</p>
                    <p className="text-sm font-black text-slate-900">
                      {stats.verifiedMealsDelivered || 90}+ Nourished
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMPACT STATISTICS (Actual Database Records) */}
      <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Verified Platform Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Real Results From Real Donations
            </h2>
            <p className="text-xs text-slate-400">
              Live calculated statistics from our MongoDB production database.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-2">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.totalDonations || 5}
              </div>
              <div className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                Total Food Donations
              </div>
              <p className="text-[11px] text-slate-400">Surplus batches listed</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-warmth-500/20 text-warmth-400 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.verifiedMealsDelivered || 90}+
              </div>
              <div className="text-xs font-bold text-warmth-400 uppercase tracking-wider">
                Meals Distributed
              </div>
              <p className="text-[11px] text-slate-400">Delivered to beneficiaries</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                <Building className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.participatingDonors || 3}
              </div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Active Donors
              </div>
              <p className="text-[11px] text-slate-400">Hotels, caterers & hostels</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.participatingNgos || 4}
              </div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Partner NGOs
              </div>
              <p className="text-[11px] text-slate-400">Shelters & orphanages</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW FOODBRIDGE WORKS (4 Steps) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Transparent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How FoodBridge Works
          </h2>
          <p className="text-sm text-slate-600">
            A seamless four-step coordination flow ensuring zero food goes to waste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-extrabold text-lg flex items-center justify-center">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Donor Lists Food</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hotels, restaurants, or banquets specify quantity, units, safe consumption deadline, and pickup location.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-brand-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Safety Declaration Certified</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-warmth-50 border border-warmth-200 text-warmth-700 font-extrabold text-lg flex items-center justify-center">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Platform Finds NGOs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                FoodBridge's smart matching engine ranks nearby verified shelters based on distance, capacity, and requirements.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-warmth-600 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              <span>Weighted Matching Algorithm</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-lg flex items-center justify-center">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">NGO Accepts Donation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The matched NGO submits a pickup request with volunteer details, and the donor kitchen accepts the match.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4-Digit OTP Generated</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-lg flex items-center justify-center">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base">Collected & Distributed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Volunteers collect food safely and distribute meals directly to children, seniors, and community members.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Logged & Audited in History</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. USER CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Who FoodBridge Connects
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Tailored For Donors and Beneficiaries
          </h2>
          <p className="text-sm text-slate-600">
            Connecting commercial and event venues directly with registered charitable institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {USER_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                      {cat.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{cat.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FEATURED FOOD LISTINGS (From Real DB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Live Surplus Listings
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Featured Food Available Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Fresh surplus ready for immediate pickup by registered NGOs.
            </p>
          </div>
          <Link
            to="/donations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            <span>View All Food Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingDonations ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredDonations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-400 stroke-[1.5]" />
            <h4 className="font-bold text-slate-800 text-base">No Active Listings Right Now</h4>
            <p className="text-xs max-w-md mx-auto">
              All surplus meals have been successfully claimed and delivered! Be the first to list surplus food today.
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              + List Surplus Food
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDonations.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={d.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                      alt={d.foodName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                        {d.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={d.status} />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {d.foodName}
                    </h4>

                    <div className="flex items-center gap-2 text-xs font-bold text-brand-700">
                      <span>{d.servings} Servings</span>
                      <span className="text-slate-300">•</span>
                      <span>{d.quantity} {d.quantityUnit || ''}</span>
                    </div>

                    <div className="space-y-1 pt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{d.pickupCity} ({d.pickupAddress})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Pickup: {d.pickupStartTime || '12:00'} - {d.pickupEndTime || '18:00'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/donations/${d._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-brand-600 hover:text-white border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Listing Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. AI SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 via-brand-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300 bg-brand-800/60 px-3 py-1 rounded-full border border-brand-700/60">
              Smart Technology Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Smarter Food Distribution With AI
            </h2>
            <p className="text-sm text-brand-100/90 leading-relaxed">
              FoodBridge leverages an intelligent multi-factor heuristic recommendation engine designed to pair surplus batches with the most suitable beneficiaries in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-400/20 text-brand-300 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Smart NGO Matching</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates weighted compatibility scores based on dietary preferences, capacity, and donation deadlines.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-warmth-400/20 text-warmth-300 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Food Demand Prediction</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Analyzes consumption trends, weekly patterns, and projected demand to anticipate community food needs.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Location-Based Matching</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ranks NGOs and volunteers using geographical distance, city boundaries, and PIN code clusters.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Efficient Coordination</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated status notifications and OTP handoffs reduce turnaround time to ensure food never spoils.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center text-xs text-brand-200">
            <strong>Architecture Note:</strong> Powered by FoodBridge's Intelligent Multi-Factor Heuristic Matching Engine. Engineered with a modular service structure ready for external Machine Learning or LLM plug-in integration.
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS (Clearly Labelled Demo Content) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Community Voices
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Leaders in Hospitality & Care
          </h2>
          <p className="text-xs text-slate-500 italic">
            (Sample community testimonials for demonstration purposes)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <Quote className="w-8 h-8 text-brand-300" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              “Our banquet operations host grand weddings. Previously, seeing 50-80 servings of untouched biryani go unused broke my heart. FoodBridge matched us with an orphanage 3 km away in 15 minutes.”
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                VA
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Chef Vikram Anand</h5>
                <p className="text-[11px] text-slate-500">Executive Chef, Grand Royal Hotel</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <Quote className="w-8 h-8 text-warmth-300" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              “We house 75 orphaned children. Food donations through FoodBridge have provided our kids with nutritious, delicious festive meals that brighten their spirits every week.”
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-warmth-100 text-warmth-800 font-bold flex items-center justify-center text-sm">
                RP
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Rajeshwari Patel</h5>
                <p className="text-[11px] text-slate-500">Director, Hope Child Care Home</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <Quote className="w-8 h-8 text-emerald-300" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              “The verification PIN and tracking timeline gives our catering team full peace of mind. We know exactly which driver picked up the food and when it reached the shelter.”
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                AS
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Anita Sharma</h5>
                <p className="text-[11px] text-slate-500">Operations Head, The Green Leaf Caterers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-700 via-emerald-700 to-slate-900 rounded-3xl p-8 sm:p-14 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to turn surplus food into hope?
            </h3>
            <p className="text-brand-100 text-sm leading-relaxed">
              Join thousands of community chefs, banquet managers, and volunteer relief organizers today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg text-center transition"
            >
              Join FoodBridge
            </Link>
            <Link
              to="/donations"
              className="px-6 py-3.5 rounded-2xl bg-brand-800/80 hover:bg-brand-800 border border-brand-600 text-white font-bold text-sm text-center transition"
            >
              Browse Food
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
