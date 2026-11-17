import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  Flame,
  ArrowRight,
  Brain,
  X,
  Phone,
  FileText,
  Save,
} from 'lucide-react';
import { donationService } from '../services/donationService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Quick realistic photo presets for ease of testing
const PHOTO_PRESETS = [
  {
    label: 'Veg Dum Biryani',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Bakery & Bread Trays',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Traditional Meal Feast',
    url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cooked Pasta & Soup',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d62810b4?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Fresh Produce & Fruits',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Packaged Food & Groceries',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
];

const FOOD_CATEGORIES = [
  'Cooked meals',
  'Rice and grains',
  'Vegetables',
  'Fruits',
  'Bakery items',
  'Packaged food',
  'Other',
];

const DonateFoodPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const now = new Date();
  const defaultCooked = new Date(now.getTime() - 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultExpiry = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    category: 'Cooked meals',
    dietaryType: 'Vegetarian',
    quantity: '',
    quantityUnit: 'meals',
    servings: '',
    cookedTime: defaultCooked,
    expiryTime: defaultExpiry,
    storageInstruction: 'Keep Hot',
    pickupAddress: user?.address || '',
    pickupCity: user?.city || 'Bengaluru',
    pinCode: user?.pinCode || '560001',
    pickupStartTime: '14:00',
    pickupEndTime: '20:00',
    contactNumber: user?.phone || '',
    additionalInstructions: '',
    imageUrl: PHOTO_PRESETS[0].url,
    safetyCertified: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Matching Recommendation Modal after successful listing
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMatches, setAiMatches] = useState(null);
  const [createdDonation, setCreatedDonation] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await donationService.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl }));
      showToast('Food image uploaded successfully!', 'success');
    } catch {
      showToast('Image upload failed, using preset instead', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (status = 'Available') => {
    setError('');

    const isDraft = status === 'Draft';

    if (!isDraft) {
      if (
        !formData.foodName ||
        !formData.quantity ||
        !formData.servings ||
        !formData.pickupAddress ||
        !formData.pickupCity
      ) {
        setError('Please fill in all mandatory fields');
        return;
      }

      if (!formData.safetyCertified) {
        setError('You must certify the food safety and hygiene declaration to publish');
        return;
      }

      if (new Date(formData.expiryTime) <= new Date()) {
        setError('Safe consumption deadline must be a future time');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await donationService.createDonation({
        ...formData,
        servings: Number(formData.servings) || 1,
        status,
        contactPhone: formData.contactNumber,
        pickupWindow: {
          from: formData.pickupStartTime,
          to: formData.pickupEndTime,
        },
      });

      const don = res.donation;
      setCreatedDonation(don);

      if (isDraft) {
        showToast('Donation saved as draft in your dashboard!', 'info');
        navigate('/donor/dashboard');
        return;
      }

      showToast('Surplus food donation listed successfully!', 'success');

      // Fetch real-time AI smart NGO recommendations for this batch
      try {
        const aiRes = await aiService.getRecommendations({ donationId: don._id });
        if (aiRes.data) {
          setAiMatches(aiRes.data);
          setShowAiModal(true);
          return;
        }
      } catch {
        // AI fallback
      }

      navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to list food donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center sm:text-left space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
          Food Donor Kitchen Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Donate Surplus Food
        </h1>
        <p className="text-sm text-slate-500">
          List fresh surplus meals from your restaurant, hotel, hostel, or banquet hall for verified local shelters.
        </p>
      </div>

      {/* Food Safety & Hygiene Charter */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>Strict Food Safety & Hygiene Declaration</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
          <strong>DO NOT list spoiled, sour, or unwholesome food.</strong> All donations must be wholesome, prepared in a sanitized kitchen, and maintained at safe temperatures (&gt;65°C for hot meals or &lt;5°C for cold storage). FoodBridge partner NGOs verify food condition upon collection.
        </p>
      </div>

      {/* Main Donation Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave('Available');
        }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100 space-y-8"
      >
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Food Details Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <UtensilsCrossed className="w-5 h-5 text-brand-600" />
            <span>1. Food Item Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Name / Item Title *
              </label>
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                placeholder="e.g. Royal Shahi Veg Dum Biryani & Paneer Gravy"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Description & Packaging Details
              </label>
              <textarea
                rows="2"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Prepared for banquet lunch. Kept hot in commercial warmers. Packed in food-grade containers."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium bg-white"
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dietary Preference *
              </label>
              <select
                name="dietaryType"
                value={formData.dietaryType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium bg-white"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Available Quantity *
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 25, 4 containers, 60"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity Unit *
              </label>
              <select
                name="quantityUnit"
                value={formData.quantityUnit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium bg-white"
              >
                <option value="meals">meals (individual meal servings)</option>
                <option value="packets">packets (boxed portions)</option>
                <option value="kg">kg (weight measurement)</option>
                <option value="servings">servings</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Number of People Fed / Servings *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="number"
                  min="1"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Timing & Safety Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-5 h-5 text-brand-600" />
            <span>2. Preparation Time & Safe Consumption Deadline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preparation Date & Time *
              </label>
              <input
                type="datetime-local"
                name="cookedTime"
                value={formData.cookedTime}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <span className="text-[11px] text-slate-400">Cooking / preparation moment</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Suitable Consumption Deadline *
              </label>
              <input
                type="datetime-local"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-amber-800"
                required
              />
              <span className="text-[11px] text-slate-400">Must be consumed before</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storage Instruction
              </label>
              <select
                name="storageInstruction"
                value={formData.storageInstruction}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Keep Hot">Keep Hot (&gt;65°C)</option>
                <option value="Keep Refrigerated">Keep Refrigerated (&lt;5°C)</option>
                <option value="Room Temperature">Room Temperature</option>
                <option value="Dry Storage">Dry Storage</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Pickup Location & Logistics */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-brand-600" />
            <span>3. Pickup Location & Available Windows</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Address / Kitchen Gate *
              </label>
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="e.g. Grand Royal Hotel, 42 MG Road, Banquet Loading Bay"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                name="pickupCity"
                value={formData.pickupCity}
                onChange={handleChange}
                placeholder="e.g. Bengaluru, Hyderabad"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
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
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Start Time *
              </label>
              <input
                type="time"
                name="pickupStartTime"
                value={formData.pickupStartTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup End Time *
              </label>
              <input
                type="time"
                name="pickupEndTime"
                value={formData.pickupEndTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Coordinator Phone Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+91 98123 45678"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Instructions for Volunteer Drivers
              </label>
              <input
                type="text"
                name="additionalInstructions"
                value={formData.additionalInstructions}
                onChange={handleChange}
                placeholder="e.g. Inform gate security you are here for FoodBridge pickup. Park at Bay 2."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Food Image */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            <span>4. Food Batch Image</span>
          </h2>

          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Select a realistic photo preset or upload your kitchen packaging picture:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PHOTO_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.url }))}
                  className={`p-1.5 rounded-2xl border-2 transition text-left group overflow-hidden ${
                    formData.imageUrl === preset.url
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-16 object-cover rounded-xl group-hover:scale-105 transition-transform"
                  />
                  <span className="block text-[10px] font-bold text-slate-700 mt-1 truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Or paste an image URL..."
                className="flex-1 w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />

              <label className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 5. Food Safety Certification */}
        <div className="p-5 rounded-2xl bg-brand-50 border border-brand-200 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="safetyCertified"
              checked={formData.safetyCertified}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              <span className="font-bold text-slate-900 block">
                Food Safety Certification *
              </span>
              I certify that this food was cooked in a sanitized commercial kitchen, stored under safe hygiene temperature guidelines, has never been in contact with contaminated utensils, and is 100% wholesome for consumption.
            </div>
          </label>
        </div>

        {/* Action Buttons: Submit Donation, Save Draft, Cancel */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/donor/dashboard')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('Draft')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Save Draft</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !formData.safetyCertified}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Publishing...' : 'Submit Donation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* AI SMART FOOD MATCHING MODAL */}
      {showAiModal && aiMatches && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowAiModal(false);
                navigate('/donor/dashboard');
              }}
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
                  AI Smart Food Matching
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Best Matching NGOs Found!
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Based on your food batch <strong>({createdDonation?.foodName}, {createdDonation?.servings} servings)</strong>, location, and deadline, FoodBridge’s heuristic matching engine ranked these nearby verified charitable organisations:
            </p>

            <div className="space-y-3">
              {aiMatches.recommendations?.map((rec, i) => (
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

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                        {rec.matchScore}% Match
                      </span>
                    </div>
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Algorithm: {aiMatches.algorithm}
              </span>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  navigate('/donor/dashboard');
                }}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
              >
                Go to Donor Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateFoodPage;
